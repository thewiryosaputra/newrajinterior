import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, QueryResult, QueryResultRow } from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
}