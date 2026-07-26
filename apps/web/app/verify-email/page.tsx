"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email") || "";
      const token = params.get("token") || "";
      setEmail(emailParam);

      if (!emailParam || !token) {
        setState("error");
        setMessage("Link verifikasi tidak lengkap. Pastikan link dibuka dari email terbaru.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?email=${encodeURIComponent(emailParam)}&token=${encodeURIComponent(token)}`,
        );
        const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };

        if (!response.ok) {
          setState("error");
          setMessage(formatApiMessage(data.message) || "Email gagal diverifikasi atau token sudah kedaluwarsa.");
          return;
        }

        setState("success");
        setMessage("Email berhasil diverifikasi. Silakan lanjut verifikasi WhatsApp atau login kembali.");
      } catch (error) {
        setState("error");
        setMessage("Tidak bisa terhubung ke server API. Coba buka link ini lagi sebentar.");
      }
    }

    void verifyEmail();
  }, []);
  const Icon = state === "success" ? CheckCircleIcon : state === "error" ? ExclamationTriangleIcon : EnvelopeIcon;

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <BrandPanel title="Email Verification" body="Verifikasi email memastikan akun dan invitation hanya dipakai oleh kontak customer yang benar." />

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
          <div className="flex justify-end">
            <button className="flex h-12 items-center gap-3 rounded-lg border bg-white px-5 text-sm font-medium shadow-sm" type="button">
              <GlobeAltIcon className="h-5 w-5" />
              Bahasa Indonesia
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xl rounded-lg border bg-white/92 p-8 text-center shadow-soft sm:p-12">
              <div
                className={[
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-lg",
                  state === "success" ? "bg-emerald-50 text-emerald-600" : state === "error" ? "bg-red-50 text-red-600" : "bg-primary/10 text-[#b87900]",
                ].join(" ")}
              >
                <Icon className="h-9 w-9" />
              </div>
              <h1 className="mt-7 font-display text-4xl font-bold">
                {state === "success" ? "Email Terverifikasi" : state === "error" ? "Verifikasi Gagal" : "Memverifikasi Email"}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{message}</p>
              {email ? <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm font-medium">{email}</p> : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button asChild className="h-12">
                  <Link href="/verify-whatsapp">Verifikasi WhatsApp</Link>
                </Button>
                <Button asChild className="h-12 bg-white text-foreground shadow-sm hover:bg-muted" variant="outline">
                  <Link href="/login">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Kembali Login
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <p className="pb-4 text-center text-sm text-muted-foreground">&copy; 2026 New Raj Interior. All rights reserved.</p>
        </section>
      </div>
    </main>
  );
}

function BrandPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="relative hidden overflow-hidden bg-[#080807] text-white lg:block">
      <Image src="/brand/login-interior-bg.png" alt="New Raj Interior verification" fill className="object-cover" sizes="45vw" priority />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.92),rgba(5,5,4,0.52)),linear-gradient(180deg,rgba(5,5,4,0.18),rgba(5,5,4,0.88))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(212,175,55,0.26),transparent_22rem)]" />
      <div className="relative z-10 flex min-h-screen flex-col justify-between px-16 py-16">
        <Image src="/brand/newraj-logo-master.png" alt="New Raj Interior" width={230} height={230} className="mx-auto h-56 w-56 rounded-full object-contain" priority />
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-white/82">{body}</p>
        </div>
        <div className="rounded-lg border border-newraj-gold/35 bg-black/25 p-5 text-sm leading-7 text-white/78">
          Sistem akan membuka akses setelah email dan WhatsApp sama-sama terverifikasi.
        </div>
      </div>
    </section>
  );
}

function formatApiMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}