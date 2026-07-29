"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  HomeIcon,
  QueueListIcon,
  UserGroupIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CreateInvitationPanel } from "@/components/admin-approval-panel";
import { Button } from "@/components/ui/button";

const navItems = [
  ["Dashboard", HomeIcon, false],
  ["Invitation", EnvelopeIcon, true],
  ["Project", BriefcaseIcon, false],
  ["BOQ", ClipboardDocumentListIcon, false],
  ["Kontrak", DocumentTextIcon, false],
  ["Invoice & Pembayaran", CreditCardIcon, false],
  ["Tugas", QueueListIcon, false],
  ["Progress", ClockIcon, false],
  ["Dokumen", FolderIcon, false],
  ["Notifikasi", BellIcon, false],
  ["Laporan", ChartBarIcon, false],
  ["Client", UsersIcon, false],
  ["Tim", UserGroupIcon, false],
  ["Pengaturan", Cog6ToothIcon, false],
] as const;

export default function DashboardInvitationPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = window.localStorage.getItem("newraj_user");
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    if (parsedUser?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem("newraj_access_token");
    window.localStorage.removeItem("newraj_user_role");
    window.localStorage.removeItem("newraj_user");
    router.replace("/login");
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] text-newraj-ink">
        <div className="rounded-lg border bg-white px-6 py-4 text-sm font-medium shadow-sm">Memeriksa sesi login...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-h-screen bg-[#070908] px-4 py-8 text-white lg:flex lg:flex-col">
          <Image
            src="/brand/newraj-logo-master.png"
            alt="New Raj Interior"
            width={156}
            height={156}
            className="mx-auto h-36 w-36 rounded-full object-contain"
            priority
          />

          <nav className="mt-8 space-y-2">
            {navItems.map(([label, Icon, active]) => (
              <button
                className={[
                  "flex h-11 w-full items-center gap-4 rounded-md px-4 text-left text-sm font-medium transition-colors",
                  active ? "bg-newraj-gold text-white shadow-gold" : "text-white/88 hover:bg-white/8 hover:text-newraj-gold",
                ].join(" ")}
                key={label}
                onClick={() => {
                  if (label === "Dashboard") router.push("/dashboard");
                  if (label === "Invitation") router.push("/dashboard/invitation");
                }}
                type="button"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
                {label === "Notifikasi" ? <span className="ml-auto rounded-md bg-newraj-gold px-2 py-0.5 text-xs text-white">8</span> : null}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-lg border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[linear-gradient(135deg,#d7d2c5,#777)]" />
              <div>
                <p className="font-semibold">Admin</p>
                <p className="text-xs text-white/68">Administrator</p>
              </div>
              <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-newraj-gold" onClick={handleLogout} type="button" aria-label="Logout">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-5 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Invitation</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Buat link invitation customer dan approve request yang sudah terverifikasi.</p>
            </div>
            <Button className="h-10 gap-2 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </Button>
          </header>

          <div className="mt-5 space-y-5">
            <CreateInvitationPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
function safeParseUser(value: string): { role?: string } | null {
  try {
    return JSON.parse(value) as { role?: string };
  } catch {
    return null;
  }
}