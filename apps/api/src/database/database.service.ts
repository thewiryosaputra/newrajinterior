import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool, QueryResult, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: this.config.getOrThrow<string>("DATABASE_URL"),
      max: 12,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    await this.query("SELECT 1");
    await this.migrate();
    await this.ensureRuntimeSchema();
    await this.seedAdminUser();
    this.logger.log("Database connection ready");
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  private async migrate() {
    await this.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const migrationId = "001_initial";
    const existing = await this.query("SELECT id FROM schema_migrations WHERE id = $1", [migrationId]);
    if (existing.rowCount) return;

    const sql = readFileSync(join(process.cwd(), "migrations", "001_initial.sql"), "utf8");
    await this.query("BEGIN");
    try {
      await this.query(sql);
      await this.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migrationId]);
      await this.query("COMMIT");
    } catch (error) {
      await this.query("ROLLBACK");
      throw error;
    }
  }

  private async ensureRuntimeSchema() {
    await this.query(`
      ALTER TABLE invitation_requests
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS password_setup_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitation_request_id UUID REFERENCES invitation_requests(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS idx_password_setup_tokens_lookup
        ON password_setup_tokens (token_hash, expires_at)
        WHERE consumed_at IS NULL
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS invitation_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        invitation_request_id UUID REFERENCES invitation_requests(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await this.query(`
      CREATE INDEX IF NOT EXISTS idx_invitation_links_lookup
        ON invitation_links (token_hash, expires_at)
        WHERE used_at IS NULL
    `);
  }

  private async seedAdminUser() {
    const password = this.config.get<string>("ADMIN_PASSWORD", "Cl@55hoster123");
    const passwordHash = await bcrypt.hash(password, 12);
    await this.query(
      `INSERT INTO users (name, email, phone, password_hash, role, email_verified_at, whatsapp_verified_at)
       VALUES ('Admin', 'admin', 'admin', $1, 'admin', now(), now())
       ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        email_verified_at = COALESCE(users.email_verified_at, now()),
        whatsapp_verified_at = COALESCE(users.whatsapp_verified_at, now()),
        updated_at = now()`,
      [passwordHash],
    );
  }
}