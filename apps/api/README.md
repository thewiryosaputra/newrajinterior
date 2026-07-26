# Newraj API

Backend NestJS untuk Newraj CRM.

## Endpoint utama

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify-email?email={email}&token={token}`
- `POST /api/auth/verify-whatsapp`
- `POST /api/auth/resend-verification`
- `POST /api/invitation-requests`
- `GET /api/invitation-requests`
- `GET /api/invitation-requests/:id`
- `GET /api/invitation-requests/verify-email/callback?email={email}&token={token}`
- `POST /api/invitation-requests/verify-whatsapp`

## Verifikasi wajib

Register dan invitation request selalu membuat dua verifikasi:

1. Email verification token, dikirim via SMTP.
2. WhatsApp OTP, dikirim via WAHA.

Login hanya mengeluarkan `accessToken` jika `emailVerified` dan `whatsappVerified` sudah true.

## Environment

Copy `.env.example` menjadi `.env`, lalu isi:

- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_SESSION`

## Local

```bash
pnpm --filter @newraj/api dev
```

## Production build

```bash
pnpm --filter @newraj/api build
pnpm --filter @newraj/api start
```