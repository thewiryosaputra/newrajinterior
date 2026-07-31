"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

function formatSchedule(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function InvitationSuccessPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] text-newraj-ink">Memuat detail jadwal...</main>}>
      <InvitationSuccessContent />
    </Suspense>
  );
}

function InvitationSuccessContent() {
  const searchParams = useSearchParams();
  const details = [
    { label: "Nama Customer", value: searchParams.get("name") || "-", icon: UserIcon },
    { label: "Nomor WhatsApp", value: searchParams.get("phone") || "-", icon: PhoneIcon },
    { label: "Jadwal Kunjungan", value: formatSchedule(searchParams.get("surveyDate")), icon: CalendarDaysIcon },
    { label: "Tipe Project", value: searchParams.get("projectType") || "-", icon: ClipboardDocumentCheckIcon },
    { label: "Alamat Project", value: searchParams.get("projectAddress") || "-", icon: MapPinIcon },
  ];
  const notes = searchParams.get("notes");

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[34%_66%]">
        <aside className="relative hidden overflow-hidden bg-[#070807] text-white lg:block">
          <Image
            src="/brand/login-interior-bg.png"
            alt="New Raj Interior schedule success"
            fill
            className="object-cover"
            sizes="34vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.62),rgba(5,5,4,0.95)),linear-gradient(90deg,rgba(5,5,4,0.74),rgba(5,5,4,0.40))]" />
          <div className="absolute -right-16 top-0 h-full w-32 rounded-l-[100%] border-l-[10px] border-newraj-gold bg-[#fbfaf7]" />
          <div className="relative z-10 flex min-h-screen flex-col px-14 py-16">
            <Image
              src="/brand/newraj-logo-master.png"
              alt="New Raj Interior"
              width={210}
              height={210}
              className="mx-auto h-52 w-52 rounded-full object-contain"
              priority
            />
            <div className="mt-10 text-center">
              <p className="font-display text-3xl tracking-[0.24em]">REQUEST</p>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-[0.10em] text-newraj-gold">
                SUCCESS
              </h1>
              <div className="mx-auto mt-5 h-px w-40 bg-newraj-gold" />
              <p className="mx-auto mt-8 max-w-xs text-lg leading-8 text-white/86">
                Jadwal kunjungan Anda sudah kami terima dan menunggu approval admin.
              </p>
            </div>
            <div className="mt-auto space-y-7">
              {[
                ["Menunggu Approval", "Admin New Raj akan mengecek request jadwal Anda."],
                ["Akun CRM", "Setelah disetujui, Anda bisa login ke dashboard CRM."],
                ["Notifikasi", "Informasi berikutnya akan dikirim melalui WhatsApp."],
              ].map(([title, body]) => (
                <div className="flex gap-4" key={title}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-newraj-gold/55 bg-black/20 text-newraj-gold">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-newraj-gold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/78">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-screen flex-col px-5 py-8 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_0%,rgba(212,175,55,0.10),transparent_28rem)]" />
          <div className="relative z-10 flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-4xl rounded-lg border bg-white/90 p-8 shadow-soft backdrop-blur sm:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircleIcon className="h-12 w-12" />
                </div>
                <h2 className="mt-7 font-display text-4xl font-bold sm:text-5xl">
                  Selamat, Anda Berhasil Request Jadwal Kunjungan
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Detail jadwal sudah diterima oleh system New Raj Interior. Proses selanjutnya adalah approval admin. Jika sudah approve, Anda sudah bisa mengakses dashboard CRM.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {details.map((item) => (
                  <div className="rounded-lg border bg-white p-5 shadow-sm" key={item.label}>
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[#b87900]">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-1 font-semibold leading-7">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {notes ? (
                <div className="mt-4 rounded-lg border bg-white p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Catatan Project</p>
                  <p className="mt-2 leading-7">{notes}</p>
                </div>
              ) : null}

              <div className="mt-8 rounded-lg border border-newraj-gold/35 bg-[#fff8e8] p-5 text-sm leading-7 text-newraj-charcoal">
                Anda tidak perlu memasukkan kode verifikasi di tahap ini. Tim New Raj Interior akan melakukan approval terlebih dahulu, lalu akses dashboard CRM akan aktif setelah disetujui.
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-14 flex-1 text-base uppercase">
                  <Link href="/login">Ke Halaman Login</Link>
                </Button>
                <Button asChild className="h-14 flex-1 bg-white text-foreground shadow-sm hover:bg-muted" variant="outline">
                  <Link href="/">Kembali</Link>
                </Button>
              </div>
            </div>
          </div>
          <p className="relative z-10 pb-4 text-center text-sm text-muted-foreground">
            © 2026 New Raj Interior. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}
