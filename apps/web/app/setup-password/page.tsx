"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.newrajinterior.xyz/api";

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] text-newraj-ink">Memuat...</main>}>
      <SetupPasswordContent />
    </Suspense>
  );
}

function SetupPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setError("Konfirmasi password belum sama.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Setup password gagal.");
      if (data.accessToken) localStorage.setItem("newraj_access_token", data.accessToken);
      setMessage("Password berhasil dibuat. Anda akan diarahkan ke dashboard.");
      window.setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup password gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#fbfaf7] text-newraj-ink lg:grid-cols-[42%_58%]">
      <aside className="relative hidden overflow-hidden bg-[#080807] text-white lg:block">
        <Image src="/brand/login-interior-bg.png" alt="New Raj Interior" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.92),rgba(5,5,4,0.52)),linear-gradient(180deg,rgba(5,5,4,0.18),rgba(5,5,4,0.88))]" />
        <div className="relative z-10 flex min-h-screen flex-col justify-center px-16">
          <Image src="/brand/newraj-logo-master.png" alt="New Raj Interior" width={210} height={210} className="h-52 w-52 rounded-full object-contain" />
          <h1 className="mt-10 font-display text-4xl font-bold">Setup Password</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-white/78">Invitation Anda sudah disetujui. Buat password untuk masuk ke dashboard customer New Raj Interior.</p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-xl rounded-lg border bg-white/92 p-8 shadow-soft sm:p-12">
          <CheckCircleIcon className="h-12 w-12 text-newraj-gold" />
          <h2 className="mt-6 font-display text-4xl font-bold">Buat Password</h2>
          <p className="mt-3 text-muted-foreground">{email ? `Untuk akun ${email}` : "Masukkan password baru Anda."}</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold" htmlFor="password">Password Baru</label>
              <div className="relative mt-3">
                <LockClosedIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type="password" className="h-12 pl-12" minLength={8} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="confirmPassword">Konfirmasi Password</label>
              <div className="relative mt-3">
                <LockClosedIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type="password" className="h-12 pl-12" minLength={8} required />
              </div>
            </div>
          </div>

          {message ? <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div> : null}
          {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}

          <Button className="mt-8 h-12 w-full text-base" disabled={loading || !token} type="submit">
            {loading ? "Menyimpan..." : "Setup Password"}
          </Button>
        </form>
      </section>
    </main>
  );
}