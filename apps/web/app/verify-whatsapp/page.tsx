"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type SubmitStatus = "idle" | "success" | "error";

export default function VerifyWhatsappPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!phone.trim() || !otp.trim()) {
      setStatus("error");
      setMessage("Nomor WhatsApp dan kode OTP wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invitation-requests/verify-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };

      if (!response.ok) {
        setStatus("error");
        setMessage(formatApiMessage(data.message) || "Kode OTP tidak valid atau sudah kedaluwarsa.");
        return;
      }

      setStatus("success");
      setMessage("WhatsApp berhasil diverifikasi. Pendaftaran Anda sedang menunggu approval admin. Setelah disetujui, link setup password akan dikirim melalui WhatsApp.");
    } catch (error) {
      setStatus("error");
      setMessage("Tidak bisa terhubung ke server API. Coba lagi sebentar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendOtp() {
    if (!phone.trim()) {
      setStatus("error");
      setMessage("Isi nomor WhatsApp dulu untuk mengirim ulang OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };

      if (!response.ok) {
        setStatus("error");
        setMessage(formatApiMessage(data.message) || "OTP gagal dikirim ulang.");
        return;
      }

      setStatus("success");
      setMessage("OTP baru sudah dikirim ke WhatsApp customer.");
    } catch (error) {
      setStatus("error");
      setMessage("Tidak bisa mengirim ulang OTP sekarang.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <section className="relative hidden overflow-hidden bg-[#080807] text-white lg:block">
          <Image src="/brand/login-interior-bg.png" alt="New Raj Interior WhatsApp verification" fill className="object-cover" sizes="45vw" priority />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.92),rgba(5,5,4,0.52)),linear-gradient(180deg,rgba(5,5,4,0.18),rgba(5,5,4,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(212,175,55,0.26),transparent_22rem)]" />
          <div className="relative z-10 flex min-h-screen flex-col justify-between px-16 py-16">
            <Image src="/brand/newraj-logo-master.png" alt="New Raj Interior" width={230} height={230} className="mx-auto h-56 w-56 rounded-full object-contain" priority />
            <div className="max-w-md">
              <h1 className="font-display text-4xl font-bold">WhatsApp Verification</h1>
              <p className="mt-5 text-lg leading-8 text-white/82">
                Setelah OTP berhasil, request Anda akan masuk ke antrean approval admin sebelum akun bisa dibuat.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {["OTP berlaku sementara", "Menunggu approval admin"].map((item) => (
                <div className="rounded-lg border border-newraj-gold/35 bg-black/25 p-4" key={item}>
                  <ShieldCheckIcon className="h-6 w-6 text-newraj-gold" />
                  <p className="mt-3 text-sm leading-6 text-white/78">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
          <div className="flex justify-end">
            <button className="flex h-12 items-center gap-3 rounded-lg border bg-white px-5 text-sm font-medium shadow-sm" type="button">
              <GlobeAltIcon className="h-5 w-5" />
              Bahasa Indonesia
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xl rounded-lg border bg-white/92 p-8 shadow-soft sm:p-12">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-[#b87900]">
                <ChatBubbleLeftRightIcon className="h-7 w-7" />
              </div>
              <h1 className="font-display text-4xl font-bold">Verifikasi WhatsApp</h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Masukkan nomor WhatsApp dan kode OTP 6 digit. Setelah berhasil, pendaftaran akan menunggu approval admin.
              </p>

              <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-semibold" htmlFor="phone">Nomor WhatsApp</label>
                  <div className="relative mt-3">
                    <PhoneIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="phone" className="h-12 pl-12" placeholder="Contoh: 081238979785" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="otp">Kode OTP</label>
                  <Input id="otp" className="mt-3 h-14 text-center text-xl font-semibold tracking-[0.45em]" inputMode="numeric" maxLength={6} placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} />
                </div>

                {message ? (
                  <div
                    className={[
                      "flex gap-3 rounded-lg border px-4 py-3 text-sm leading-6",
                      status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700",
                    ].join(" ")}
                  >
                    {status === "success" ? <CheckCircleIcon className="h-5 w-5 shrink-0" /> : <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />}
                    <span>{message}</span>
                  </div>
                ) : null}

                {status === "success" ? (
                  <div className="rounded-lg border border-primary/25 bg-[#fffaf0] p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#b87900]" />
                      <div>
                        <p className="font-display text-lg font-semibold">Menunggu Approval Admin</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Admin New Raj Interior akan meninjau pendaftaran Anda. Jika sudah disetujui, link setup password akan dikirim ke WhatsApp Anda. Setelah password dibuat, Anda baru bisa login ke dashboard customer.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button className="h-12 w-full text-base" disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Memverifikasi..." : "Verifikasi WhatsApp"}
                    </Button>

                    <Button className="h-12 w-full bg-white text-foreground shadow-sm hover:bg-muted" disabled={isSubmitting} onClick={resendOtp} type="button" variant="outline">
                      Kirim Ulang OTP
                    </Button>
                  </>
                )}

                <Button asChild className="h-12 w-full bg-white text-foreground shadow-sm hover:bg-muted" variant="outline">
                  <Link href="/login">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Kembali ke Login
                  </Link>
                </Button>
              </form>
            </div>
          </div>

          <p className="pb-4 text-center text-sm text-muted-foreground">&copy; 2026 New Raj Interior. All rights reserved.</p>
        </section>
      </div>
    </main>
  );
}

function formatApiMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}