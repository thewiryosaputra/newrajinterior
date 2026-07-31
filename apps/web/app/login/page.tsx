"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type LoginMode = "team" | "client";

type LoginResponse = {
  accessToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  message?: string | string[];
};

const benefits = [
  {
    title: "Kelola Project",
    body: "Kelola seluruh project dalam satu tempat",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Pantau Progress",
    body: "Monitor progress secara real-time dan akurat",
    icon: ChartBarIcon,
  },
  {
    title: "Aman & Terpercaya",
    body: "Akses team dan client dipisahkan sesuai kebutuhan",
    icon: ShieldCheckIcon,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("client");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error">("success");

  async function handleTeamLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!teamEmail.trim() || !teamPassword) {
      setStatus("error");
      setMessage("Email dan password team wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: teamEmail.trim(), password: teamPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok || !data.accessToken) {
        setStatus("error");
        setMessage(formatApiMessage(data.message) || "Login team gagal. Periksa email dan password.");
        return;
      }

      window.localStorage.setItem("newraj_access_token", data.accessToken);
      if (data.user) {
        window.localStorage.setItem("newraj_user", JSON.stringify(data.user));
        window.localStorage.setItem("newraj_user_role", data.user.role);
      }
      router.replace("/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage("Tidak bisa terhubung ke server login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClientLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!clientPhone.trim()) {
      setStatus("error");
      setMessage("Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clientPhone.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        setStatus("error");
        setMessage(formatApiMessage(data.message) || "OTP WhatsApp gagal dikirim.");
        return;
      }

      window.localStorage.setItem("newraj_pending_client_phone", clientPhone.trim());
      setStatus("success");
      setMessage("Kode OTP sudah dikirim ke WhatsApp. Tahap berikutnya adalah verifikasi OTP untuk masuk sebagai client.");
    } catch (error) {
      setStatus("error");
      setMessage("Tidak bisa mengirim OTP WhatsApp sekarang.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <section className="relative hidden overflow-hidden bg-[#080807] text-white lg:block">
          <Image
            src="/brand/login-interior-bg.png"
            alt="Luxury New Raj Interior"
            fill
            className="object-cover"
            sizes="45vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.92),rgba(5,5,4,0.52)),linear-gradient(180deg,rgba(5,5,4,0.18),rgba(5,5,4,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(212,175,55,0.26),transparent_22rem)]" />
          <div className="relative z-10 flex min-h-screen flex-col justify-between px-16 py-16">
            <div className="mx-auto text-center">
              <Image
                src="/brand/newraj-logo-master.png"
                alt="New Raj Interior"
                width={230}
                height={230}
                className="mx-auto h-56 w-56 rounded-full object-contain"
                priority
              />
            </div>

            <div className="max-w-md">
              <h1 className="font-display text-4xl font-bold">Welcome Back!</h1>
              <p className="mt-5 text-lg leading-8 text-white/82">
                Team masuk dengan email dan password. Client masuk memakai nomor WhatsApp dan kode OTP.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {benefits.map((item) => (
                <div key={item.title}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-newraj-gold/55 text-newraj-gold">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{item.body}</p>
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
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xl rounded-lg border bg-white/92 p-8 shadow-soft sm:p-12">
              <div className="mb-9 lg:hidden">
                <Image
                  src="/brand/newraj-logo-master.png"
                  alt="New Raj Interior"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-contain"
                />
              </div>
              <h2 className="font-display text-4xl font-bold">Login</h2>
              <p className="mt-3 text-base text-muted-foreground">Pilih tipe akun untuk masuk ke New Raj CRM.</p>

              <div className="mt-8 grid grid-cols-2 rounded-lg border bg-[#faf9f5] p-1">
                <button
                  className={["h-11 rounded-md text-sm font-semibold transition-colors", mode === "client" ? "bg-newraj-gold text-white shadow-sm" : "text-newraj-charcoal hover:bg-white"].join(" ")}
                  onClick={() => {
                    setMode("client");
                    setMessage(null);
                  }}
                  type="button"
                >
                  Login Client
                </button>
                <button
                  className={["h-11 rounded-md text-sm font-semibold transition-colors", mode === "team" ? "bg-newraj-gold text-white shadow-sm" : "text-newraj-charcoal hover:bg-white"].join(" ")}
                  onClick={() => {
                    setMode("team");
                    setMessage(null);
                  }}
                  type="button"
                >
                  Login Team
                </button>
              </div>

              {mode === "client" ? (
                <form className="mt-8 space-y-6" onSubmit={handleClientLogin}>
                  <div>
                    <label className="text-sm font-semibold" htmlFor="client-phone">Nomor WhatsApp</label>
                    <div className="relative mt-3">
                      <PhoneIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                      <Input id="client-phone" className="h-12 pl-12" inputMode="tel" placeholder="Contoh: 081234567890" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Client cukup memasukkan nomor WhatsApp. Sistem akan mengirim kode OTP untuk login.
                    </p>
                  </div>

                  {message ? <StatusMessage status={status} message={message} /> : null}

                  <Button className="h-12 w-full text-base" disabled={isSubmitting} type="submit">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    {isSubmitting ? "Mengirim OTP..." : "Kirim OTP WhatsApp"}
                  </Button>
                </form>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleTeamLogin}>
                  <div>
                    <label className="text-sm font-semibold" htmlFor="team-email">Email Team</label>
                    <div className="relative mt-3">
                      <EnvelopeIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                      <Input id="team-email" className="h-12 pl-12" placeholder="Masukkan email team" value={teamEmail} onChange={(event) => setTeamEmail(event.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold" htmlFor="team-password">Password</label>
                    <div className="relative mt-3">
                      <LockClosedIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                      <Input id="team-password" type="password" className="h-12 pl-12 pr-12" placeholder="Masukkan password" value={teamPassword} onChange={(event) => setTeamPassword(event.target.value)} />
                      <EyeSlashIcon className="absolute right-4 top-3 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <label className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-newraj-gold text-white">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                      Ingat saya
                    </label>
                    <a className="font-medium text-[#b87900] underline underline-offset-4" href="/forgot-password">Lupa Password?</a>
                  </div>

                  {message ? <StatusMessage status={status} message={message} /> : null}

                  <Button className="h-12 w-full text-base" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Memproses..." : "Login Team"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <p className="pb-4 text-center text-sm text-muted-foreground">
            (c) 2026 New Raj Interior. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}

function StatusMessage({ status, message }: { status: "success" | "error"; message: string }) {
  return (
    <div className={["rounded-lg border px-4 py-3 text-sm font-medium", status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"].join(" ")}>
      {message}
    </div>
  );
}

function formatApiMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}
