"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const API_BASE_URL = "https://api.newrajinterior.xyz/api";

const ReadOnlyLocationMap = dynamic(
  () => import("@/components/read-only-location-map").then((module) => module.ReadOnlyLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg bg-[#f8f4ea] text-sm text-muted-foreground">
        Memuat peta...
      </div>
    ),
  },
);

type SurveyReport = {
  id: string;
  photoLink?: string | null;
  videoLink?: string | null;
  measurementNotes: string;
  createdAt: string;
};

type DesignPresentation = {
  id: string;
  title: string;
  presentationDate: string;
  status: string;
  clientNote?: string | null;
  customerName: string;
  phone: string;
  projectType: string;
  projectAddress: string;
  createdAt: string;
};

type InvitationRequest = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  surveyDate: string;
  projectType: string;
  estimatedBudget: string;
  projectAddress: string;
  latitude: number;
  longitude: number;
  status: string;
  emailVerified: boolean;
  whatsappVerified: boolean;
  approvedAt?: string | null;
  userId?: string | null;
  notes?: string | null;
  surveyRescheduleNote?: string | null;
  surveyorApprovedAt?: string | null;
  surveyReports?: SurveyReport[];
  createdAt: string;
};

const stats = [
  { label: "Total Project", value: "24", sub: "Semua Project", icon: ClipboardDocumentCheckIcon, dark: true },
  { label: "Dalam Proses", value: "12", sub: "Project Aktif", icon: BriefcaseIcon },
  { label: "Dalam Antrian", value: "5", sub: "Menunggu Jadwal", icon: ClockIcon },
  { label: "Selesai", value: "7", sub: "Project Selesai", icon: CheckBadgeIcon },
];

const stages = [
  { name: "Pengukuran", count: 4, body: "Survey & Ukur", color: "#d99a00", icon: CalendarDaysIcon },
  { name: "Desain", count: 3, body: "Proses Desain", color: "#e8743b", icon: WrenchScrewdriverIcon },
  { name: "Produksi", count: 3, body: "Proses Produksi", color: "#6b85c4", icon: Cog6ToothIcon },
  { name: "Instalasi", count: 2, body: "Pemasangan", color: "#27a8a0", icon: UserGroupIcon },
  { name: "Selesai", count: 7, body: "Project Selesai", color: "#65b95a", icon: ShieldCheckIcon },
];

const projects = [
  ["Villa Kencana", "Kitchen Set & Interior", "Budi Santoso", "Desain", 65, "20 Mei 2027", "Dian"],
  ["Rumah Kebon Jeruk", "Kitchen Set", "Andi Wijaya", "Produksi", 90, "15 Mei 2027", "Dian"],
  ["Apartemen Taman Anggrek", "Kitchen Set & Wardrobe", "Maria Claudia", "Instalasi", 70, "25 Mei 2027", "Rizky"],
  ["Ruko Sunter", "Kitchen Set & Display", "Jonathan", "Dalam Antrian", 0, "Menunggu Jadwal", "Dian"],
] as const;

const notifications = [
  ["Design project Villa Kencana siap dipresentasikan", "Interior Designer mengirim info design siap presentasi", "10 menit lalu", "#d99a00"],
  ["Invoice Termin 1 telah dibayar", "Pembayaran diterima dan sedang diverifikasi", "30 menit lalu", "#27a8a0"],
  ["BOQ #BOQ-2025-004 telah disetujui client", "Menunggu tanda tangan kontrak", "1 jam lalu", "#65b95a"],
  ["Progress project Rumah Kebon Jeruk 90%", "Sistem mengirimkan tagihan Termin 2", "3 jam lalu", "#e8743b"],
  ["Dokumen kontrak sudah ditandatangani client", "Siap untuk proses pembayaran", "5 jam lalu", "#9ca3af"],
] as const;

const finance = [
  ["Sudah Dibayar", "Rp 456.750.000", "36.7%", "text-emerald-600"],
  ["Sisa Tagihan", "Rp 789.050.000", "", ""],
  ["Tunggakan", "Rp 12.450.000", "", "text-red-600"],
] as const;

const paymentBreakdown = [
  ["Termin 1 (DP)", "36.7%", "Rp 456.750.000", "bg-[#d99a00]"],
  ["Termin 2 (Progres)", "28.3%", "Rp 352.500.000", "bg-[#6b85c4]"],
  ["Termin 3 (Pelunasan)", "32.1%", "Rp 400.500.000", "bg-[#65b95a]"],
  ["Tunggakan", "2.9%", "Rp 36.050.000", "bg-[#ef4444]"],
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; phone?: string; role?: string } | null>(null);
  const [invitations, setInvitations] = useState<InvitationRequest[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [designPresentations, setDesignPresentations] = useState<DesignPresentation[]>([]);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const storedUser = window.localStorage.getItem("newraj_user");
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    setCurrentUser(parsedUser);
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    async function loadInvitations() {
      try {
        const token = window.localStorage.getItem("newraj_access_token");
        const storedUser = window.localStorage.getItem("newraj_user");
        const user = storedUser ? safeParseUser(storedUser) : null;
        const endpoint = user?.role === "customer" ? "invitation-requests/my" : "invitation-requests";
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          cache: "no-store",
          headers: user?.role === "customer" ? { Authorization: `Bearer ${token ?? ""}` } : undefined,
        });
        const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest[]; message?: string | string[] };

        if (!response.ok) {
          setInvitationError(formatApiMessage(payload.message) || "Data invitation belum bisa dimuat.");
          return;
        }

        setInvitations(payload.data || []);

        if (user?.role === "customer") {
          const designResponse = await fetch(`${API_BASE_URL}/invitation-requests/my-design-presentations`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token ?? ""}` },
          });
          const designPayload = (await designResponse.json().catch(() => ({}))) as { data?: DesignPresentation[] };
          if (designResponse.ok) setDesignPresentations(designPayload.data || []);
        }
      } catch (error) {
        setInvitationError("Tidak bisa terhubung ke API invitation.");
      } finally {
        setIsLoadingInvitations(false);
      }
    }

    void loadInvitations();
  }, [authChecked]);

  const verifiedCount = useMemo(
    () => invitations.filter((item) => item.whatsappVerified).length,
    [invitations],
  );
  const pendingCount = Math.max(invitations.length - verifiedCount, 0);
  const liveStats = [
    { label: "Invitation Request", value: String(invitations.length), sub: "Data dari backend", icon: ClipboardDocumentCheckIcon, dark: true },
    { label: "Menunggu Verifikasi", value: String(pendingCount), sub: "WhatsApp pending", icon: ClockIcon },
    { label: "Terverifikasi", value: String(verifiedCount), sub: "Siap dibuat project", icon: CheckBadgeIcon },
    { label: "Project Aktif", value: "12", sub: "Data dummy sementara", icon: BriefcaseIcon },
  ];

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

  if (currentUser?.role === "surveyor") {
    return (
      <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
        <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
          <DashboardSidebar activeItem="Survey" user={currentUser} onLogout={handleLogout} />
          <SurveyorDashboard
            invitations={invitations.filter((item) => item.status === "approved" || Boolean(item.approvedAt))}
            isLoading={isLoadingInvitations}
            error={invitationError}
            surveyorName={currentUser.name || "Surveyor"}
            onUpdated={(updated) => setInvitations((current) => current.map((item) => item.id === updated.id ? updated : item))}
          />
        </div>
      </main>
    );
  }

  if (currentUser?.role === "designer") {
    const reports = invitations.flatMap((item) => (item.surveyReports || []).map((report) => ({ ...report, client: item })));
    return (
      <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
        <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
          <DashboardSidebar activeItem="Dashboard" user={currentUser} onLogout={handleLogout} />
          <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
            <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold">Dashboard Designer</h1>
                <p className="mt-2 text-sm text-newraj-charcoal">Report survey yang sudah masuk dan siap diproses ke design.</p>
              </div>
              <Badge variant="warning">{reports.length} Siap Design</Badge>
            </header>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard label="Report Masuk" value={String(reports.length)} sub="Siap untuk design" icon={ClipboardDocumentCheckIcon} dark />
              <StatCard label="BOQ Draft" value="3" sub="Perlu dilengkapi" icon={DocumentTextIcon} />
              <StatCard label="Review PM" value="1" sub="Menunggu approval" icon={ClockIcon} />
            </div>
            <section className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
              <SectionHeader title="Report Siap Design" />
              <div className="mt-5 overflow-hidden rounded-lg border">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal"><tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Report</th><th className="px-4 py-3">Aksi</th></tr></thead>
                  <tbody className="divide-y bg-white">
                    {reports.slice(0, 6).map((report) => (
                      <tr key={report.id} className="hover:bg-[#fffaf0]"><td className="px-4 py-3 font-semibold">{report.client.customerName}</td><td className="px-4 py-3 text-muted-foreground">{report.client.projectType}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(report.createdAt)}</td><td className="px-4 py-3"><Button asChild size="sm"><a href="/dashboard/designer/report-list">Lihat Report</a></Button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        </div>
      </main>
    );
  }

  if (currentUser?.role === "customer") {
    return (
      <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
        <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
          <DashboardSidebar activeItem="Dashboard" user={currentUser} onLogout={handleLogout} />
          <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
            <header className="flex flex-col gap-3 border-b pb-5">
              <h1 className="font-display text-4xl font-bold">Dashboard Client</h1>
              <p className="text-sm text-newraj-charcoal">Selamat datang, {currentUser.name || "Customer"}. Berikut detail invitation yang sudah Anda isi.</p>
            </header>
            <div className="mt-6 grid gap-5">
              <ClientDesignSchedule designs={designPresentations} onUpdated={(updated) => setDesignPresentations((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item))} />
              {isLoadingInvitations ? (
                <p className="rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat detail invitation...</p>
              ) : invitationError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{invitationError}</p>
              ) : invitations.length === 0 ? (
                <p className="rounded-lg border bg-white p-5 text-sm text-muted-foreground">Belum ada detail invitation untuk akun ini.</p>
              ) : (
                <div className="grid gap-5">
                  {invitations.map((item) => <ClientInvitationDetail key={item.id} item={item} />)}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="Dashboard" user={currentUser} onLogout={handleLogout} />

        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-5 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-6">
              <h1 className="font-display text-4xl font-bold">Dashboard</h1>
              <p className="text-sm text-newraj-charcoal">Selamat pagi, Dian</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-full min-w-0 sm:w-[420px]">
                <input
                  className="h-12 w-full rounded-lg border bg-white px-5 pr-12 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Cari project, client, invoice..."
                />
                <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5" />
              </div>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" type="button">
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1 top-0 rounded-full bg-newraj-gold px-1.5 text-[10px] font-bold text-white">8</span>
              </button>
              <button className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-muted sm:flex" type="button">
                <EnvelopeIcon className="h-5 w-5" />
              </button>
              <Button className="h-10 gap-2 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </header>

          <div className="mt-5 grid gap-5 xl:grid-cols-4">
            {liveStats.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
            <div className="space-y-5">
              <section className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold">Ringkasan Progress Project</h2>
                <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-muted">
                  <div className="bg-[#d99a00]" style={{ width: "39%" }} />
                  <div className="bg-[#e8743b]" style={{ width: "20%" }} />
                  <div className="bg-[#6b85c4]" style={{ width: "12%" }} />
                  <div className="bg-[#27a8a0]" style={{ width: "9%" }} />
                  <div className="bg-[#65b95a]" style={{ width: "20%" }} />
                </div>
                <div className="mt-8 grid gap-4 text-sm text-muted-foreground sm:grid-cols-5">
                  {[
                    ["Dalam Proses", "12", "#d99a00"],
                    ["Dalam Antrian", "5", "#e8743b"],
                    ["Produksi", "3", "#6b85c4"],
                    ["Instalasi", "2", "#27a8a0"],
                    ["Selesai", "7", "#65b95a"],
                  ].map(([label, value, color]) => (
                    <div className="flex items-center gap-3" key={label}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                      <span className="ml-auto font-semibold text-newraj-ink">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border bg-white p-6 shadow-sm">
                <SectionHeader title="Project Tahap Saat Ini" />
                <div className="mt-6 grid gap-4 md:grid-cols-5">
                  {stages.map((stage) => (
                    <StageCard key={stage.name} {...stage} />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border bg-white p-6 shadow-sm">
                <SectionHeader title="Project Aktif" />
                <div className="mt-5 overflow-hidden rounded-lg border">
                  <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                    <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Project</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 font-semibold">Tahap Saat Ini</th>
                        <th className="px-4 py-3 font-semibold">Progress</th>
                        <th className="px-4 py-3 font-semibold">Target Selesai</th>
                        <th className="px-4 py-3 font-semibold">PM</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {projects.map((project, index) => (
                        <ProjectRow key={project[0]} index={index} project={project} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total 4 project</span>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline"><ChevronLeftIcon className="h-4 w-4" /></Button>
                    <Button size="icon">1</Button>
                    <Button size="icon" variant="outline"><ChevronRightIcon className="h-4 w-4" /></Button>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-lg border bg-white p-6 shadow-sm">
                <SectionHeader title="Invitation Request Terbaru" />
                <div className="mt-5 space-y-4">
                  {isLoadingInvitations ? (
                    <p className="text-sm text-muted-foreground">Memuat data invitation...</p>
                  ) : invitationError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{invitationError}</p>
                  ) : invitations.length === 0 ? (
                    <p className="rounded-lg border bg-[#faf9f5] p-4 text-sm text-muted-foreground">Belum ada invitation request masuk.</p>
                  ) : (
                    invitations.slice(0, 5).map((item) => (
                      <div className="rounded-lg border bg-[#fffdf8] p-4" key={item.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold leading-5">{item.customerName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.projectType} â€¢ {item.estimatedBudget}</p>
                          </div>
                          <InvitationStatusBadge item={item} />
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-newraj-charcoal">{item.projectAddress}</p>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <span>Survey: {formatDate(item.surveyDate)}</span>
                          <span>WA: {item.phone}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-lg border bg-white p-6 shadow-sm">
                <SectionHeader title="Ringkasan Keuangan" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#101010] p-5 text-white">
                    <p className="text-sm text-white/80">Total Nilai Project</p>
                    <p className="mt-3 font-display text-2xl">Rp 1.245.800.000</p>
                  </div>
                  {finance.map(([label, value, percent, className]) => (
                    <div className="rounded-lg border bg-white p-5" key={label}>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className={["font-display text-xl", className].join(" ")}>{value}</p>
                        {percent ? <span className={className}>{percent}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border p-5">
                  <p className="font-semibold">Breakdown Pembayaran</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
                    <div className="mx-auto h-32 w-32 rounded-full bg-[conic-gradient(#d99a00_0_36.7%,#6b85c4_36.7%_65%,#65b95a_65%_97.1%,#ef4444_97.1%_100%)] p-5">
                      <div className="h-full w-full rounded-full bg-white" />
                    </div>
                    <div className="space-y-4 text-sm">
                      {paymentBreakdown.map(([label, percent, value, color]) => (
                        <div className="grid grid-cols-[1fr_58px_auto] items-center gap-3" key={label}>
                          <span className="flex items-center gap-3 text-muted-foreground"><i className={["h-3 w-3 rounded-sm", color].join(" ")} />{label}</span>
                          <span className="font-semibold">{percent}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <button className="text-sm font-medium text-[#b87900]" type="button">Lihat Semua</button>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  dark,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  dark?: boolean;
}) {
  return (
    <section className={["relative overflow-hidden rounded-lg border p-6 shadow-sm", dark ? "bg-[#101010] text-white" : "bg-white"].join(" ")}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm">{label}</p>
          <p className="mt-3 font-display text-4xl">{value}</p>
          <p className={["mt-3 text-sm", dark ? "text-white/78" : "text-muted-foreground"].join(" ")}>{sub}</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-newraj-gold/45 bg-newraj-gold/10 text-newraj-gold">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <Sparkline dark={dark} />
    </section>
  );
}

function Sparkline({ dark }: { dark?: boolean }) {
  return (
    <svg className="ml-auto mt-4 h-10 w-36" viewBox="0 0 144 42" aria-hidden="true">
      <path d="M2 32 L14 30 L26 34 L39 27 L52 31 L64 20 L77 6 L90 20 L103 27 L116 23 L130 26 L142 14" fill="none" stroke={dark ? "#d4af37" : "#e5a814"} strokeWidth="2" />
      <path d="M2 32 L14 30 L26 34 L39 27 L52 31 L64 20 L77 6 L90 20 L103 27 L116 23 L130 26 L142 14 L142 42 L2 42 Z" fill={dark ? "rgba(212,175,55,0.10)" : "rgba(212,175,55,0.08)"} />
    </svg>
  );
}

function StageCard({
  name,
  count,
  body,
  color,
  icon: Icon,
}: {
  name: string;
  count: number;
  body: string;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: `${color}0D`, borderColor: `${color}40` }}>
      <p className="text-sm font-medium">{name}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-display text-3xl">{count}</p>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">On Going</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: readonly [string, string, string, string, number, string, string];
  index: number;
}) {
  const [name, type, client, stage, progress, date, pm] = project;
  const badgeVariant = stage === "Produksi" ? "default" : stage === "Instalasi" ? "success" : stage === "Dalam Antrian" ? "warning" : "muted";

  return (
    <tr className="hover:bg-[#fffaf0]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-16 overflow-hidden rounded-md bg-[#111]">
            <Image src="/brand/login-interior-bg.png" alt={name} fill className="object-cover" sizes="64px" style={{ objectPosition: `${35 + index * 12}% center` }} />
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">{client}</td>
      <td className="px-4 py-3"><Badge variant={badgeVariant}>{stage}</Badge></td>
      <td className="px-4 py-3">
        {progress ? (
          <div className="flex items-center gap-3">
            <div className="h-2 w-28 rounded-full bg-muted"><div className="h-full rounded-full bg-newraj-gold" style={{ width: `${progress}%` }} /></div>
            <span>{progress}%</span>
          </div>
        ) : "-"}
      </td>
      <td className="px-4 py-3">{date}</td>
      <td className="px-4 py-3">{pm}</td>
      <td className="px-4 py-3"><Button size="icon" variant="ghost"><EllipsisVerticalIcon className="h-5 w-5" /></Button></td>
    </tr>
  );
}



function SurveyorDashboard({
  invitations,
  isLoading,
  error,
  surveyorName,
  onUpdated,
}: {
  invitations: InvitationRequest[];
  isLoading: boolean;
  error: string | null;
  surveyorName: string;
  onUpdated: (updated: InvitationRequest) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = invitations.find((item) => item.id === selectedId) ?? null;

  return (
    <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
      <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">List Client Survey</h1>
          <p className="mt-2 text-sm text-newraj-charcoal">Selamat datang, {surveyorName}. Pilih client approved yang akan dikunjungi.</p>
        </div>
        <Badge variant="warning">{invitations.length} Jadwal Survey</Badge>
      </header>

      {isLoading ? (
        <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat daftar survey...</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</p>
      ) : invitations.length === 0 ? (
        <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Belum ada client approved untuk disurvey.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal">
              <tr>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Lokasi</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Surveyor</th>
                <th className="px-4 py-3 font-semibold">Report</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {invitations.map((item) => {
                const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + item.latitude + "," + item.longitude + "&travelmode=driving";
                return (
                  <tr key={item.id} className="hover:bg-[#fffaf0]">
                    <td className="px-4 py-4">
                      <p className="font-semibold">{item.customerName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(item.surveyDate)}</td>
                    <td className="px-4 py-4 text-muted-foreground">{formatTime(item.surveyDate)}</td>
                    <td className="px-4 py-4">
                      <div className="max-w-[300px]">
                        <p className="line-clamp-2 leading-6">{item.projectAddress}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.latitude}, {item.longitude}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4"><Badge variant="muted">{item.projectType}</Badge></td>
                    <td className="px-4 py-4">{item.surveyorApprovedAt ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Belum Approve</Badge>}</td>
                    <td className="px-4 py-4 text-muted-foreground">{item.surveyReports?.length || 0} report</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" type="button" onClick={() => setSelectedId(item.id)}>
                          Lihat Detail
                        </Button>
                        <Button asChild size="sm" className="bg-white text-foreground shadow-sm hover:bg-muted" variant="outline">
                          <a href={googleMapsUrl} target="_blank" rel="noreferrer">Visit</a>
                        </Button>
                        <Button asChild size="sm" className="bg-white text-foreground shadow-sm hover:bg-muted" variant="outline">
                          <a href={"/dashboard/survey-report/new?id=" + item.id}>Report</a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <SurveyDetailModal
          item={selected}
          onClose={() => setSelectedId(null)}
          onUpdated={onUpdated}
        />
      ) : null}


    </section>
  );
}

function SurveyDetailModal({
  item,
  onClose,
  onUpdated,
}: {
  item: InvitationRequest;
  onClose: () => void;
  onUpdated: (updated: InvitationRequest) => void;
}) {
  return (
    <div className="fixed inset-0 z-[1400] overflow-y-auto bg-black/55 px-4 py-6" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-6xl rounded-lg bg-[#fbfaf7] p-4 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Detail Survey</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.customerName}</p>
          </div>
          <Button className="bg-white text-foreground shadow-sm hover:bg-muted" variant="outline" type="button" onClick={onClose}>Tutup</Button>
        </div>
        <SurveyDetail item={item} onUpdated={onUpdated} />
      </div>
    </div>
  );
}

function SurveyDetail({ item, onUpdated }: { item: InvitationRequest; onUpdated: (updated: InvitationRequest) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionError, setActionError] = useState("");
  const position = { lat: item.latitude, lng: item.longitude };
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + item.latitude + "," + item.longitude + "&travelmode=driving";

  async function approveSurveyorVisit() {
    setActionError("");
    setIsApproving(true);
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("newraj_access_token") : null;
      const response = await fetch(API_BASE_URL + "/invitation-requests/" + item.id + "/surveyor-approve", {
        method: "POST",
        headers: { Authorization: "Bearer " + (token ?? "") },
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest; message?: string | string[] };
      if (!response.ok || !payload.data) {
        const message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
        throw new Error(message || "Approval surveyor gagal.");
      }
      onUpdated({ ...payload.data, status: "approved", surveyorApprovedAt: payload.data.surveyorApprovedAt ?? new Date().toISOString() });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Approval surveyor gagal.");
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold">{item.customerName}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.projectType}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-11" type="button" disabled={Boolean(item.surveyorApprovedAt) || isApproving} onClick={approveSurveyorVisit}>
            <CheckBadgeIcon className="h-5 w-5" />
            {item.surveyorApprovedAt ? "Approved Surveyor" : isApproving ? "Mengirim..." : "Approve Visit"}
          </Button>
          <Button className="h-11 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
            <CalendarDaysIcon className="h-5 w-5" />
            Ubah Jadwal
          </Button>
          <Button asChild className="h-11">
            <a href={googleMapsUrl} target="_blank" rel="noreferrer">
              <MapPinIcon className="h-5 w-5" />
              Visit
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailBox label="Nomor WhatsApp" value={item.phone} />
        <DetailBox label="Tanggal" value={formatDate(item.surveyDate)} />
        <DetailBox label="Waktu" value={formatTime(item.surveyDate)} />
        <DetailBox label="Koordinat" value={item.latitude + ", " + item.longitude} />
        <DetailBox label="Approval Surveyor" value={item.surveyorApprovedAt ? formatDateTime(item.surveyorApprovedAt) : "Belum approved"} />
      </div>
      {actionError ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div> : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div className="rounded-lg border bg-[#fffdf8] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold"><MapPinIcon className="h-5 w-5 text-newraj-gold" />Alamat Project</p>
            <p className="mt-3 text-sm leading-7 text-newraj-charcoal">{item.projectAddress}</p>
          </div>
          {item.surveyRescheduleNote ? (
            <div className="rounded-lg border border-newraj-gold/35 bg-[#fff8e8] p-5">
              <p className="text-sm font-semibold">Catatan Perubahan Jadwal</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{item.surveyRescheduleNote}</p>
            </div>
          ) : null}
          {item.notes ? (
            <div className="rounded-lg border bg-white p-5">
              <p className="text-sm font-semibold">Catatan Client</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{item.notes}</p>
            </div>
          ) : null}
          <a className="flex h-12 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold shadow-sm hover:bg-muted" href={"tel:" + item.phone}>
            <PhoneIcon className="h-5 w-5" /> Call Client
          </a>
          <SurveyReportList reports={item.surveyReports || []} />
        </div>
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <ReadOnlyLocationMap position={position} />
        </div>
      </div>
      {isModalOpen ? (
        <RescheduleModal
          item={item}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(updated) => {
            onUpdated(updated);
            setIsModalOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}


function SurveyReportList({ reports }: { reports: SurveyReport[] }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">List Report Survey</p>
        <Badge variant="muted">{reports.length} report</Badge>
      </div>
      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Belum ada report survey.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-md border bg-[#faf9f5] p-4">
              <p className="text-xs font-semibold text-muted-foreground">{formatDateTime(report.createdAt)}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{report.measurementNotes}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {report.photoLink ? <a className="font-semibold text-newraj-gold underline" href={report.photoLink} target="_blank" rel="noreferrer">Link Foto</a> : null}
                {report.videoLink ? <a className="font-semibold text-newraj-gold underline" href={report.videoLink} target="_blank" rel="noreferrer">Link Video</a> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RescheduleModal({
  item,
  onClose,
  onSuccess,
}: {
  item: InvitationRequest;
  onClose: () => void;
  onSuccess: (updated: InvitationRequest) => void;
}) {
  const [date, setDate] = useState(toDateInputValue(item.surveyDate));
  const [time, setTime] = useState(toTimeInputValue(item.surveyDate));
  const [note, setNote] = useState(item.surveyRescheduleNote ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("newraj_access_token") : null;
      const response = await fetch(API_BASE_URL + "/invitation-requests/" + item.id + "/reschedule-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (token ?? ""),
        },
        body: JSON.stringify({
          surveyDate: toApiDateTimeFromInputs(date, time),
          note,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest; message?: string | string[] };

      if (!response.ok || !payload.data) {
        const message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
        throw new Error(message || "Jadwal survey gagal diubah.");
      }

      onSuccess(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadwal survey gagal diubah.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="relative z-[1601] w-full max-w-lg rounded-lg border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Ubah Jadwal Survey</h3>
            <p className="mt-1 text-sm text-newraj-charcoal">Client akan menerima notifikasi WhatsApp setelah jadwal disimpan.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border px-3 py-1 text-sm text-newraj-charcoal">
            Tutup
          </button>
        </div>

        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Tanggal
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Waktu
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Alasan atau catatan
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Contoh: Client minta jadwal sore karena ada kegiatan pagi."
              className="resize-none rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
function ClientDesignSchedule({ designs, onUpdated }: { designs: DesignPresentation[]; onUpdated: (updated: Partial<DesignPresentation> & { id: string }) => void }) {
  const [active, setActive] = useState<DesignPresentation | null>(null);
  const [mode, setMode] = useState<"reschedule" | "pending" | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(item: DesignPresentation, action: "approve" | "reschedule" | "pending" | "cancel") {
    setError("");
    if ((action === "reschedule" || action === "pending") && !dateTime) {
      setError(action === "pending" ? "Perkiraan waktu wajib diisi." : "Tanggal reschedule wajib diisi.");
      return;
    }
    if (action === "pending" && !note.trim()) {
      setError("Catatan pending wajib diisi.");
      return;
    }
    setBusyId(item.id);
    try {
      const token = window.localStorage.getItem("newraj_access_token");
      const response = await fetch(API_BASE_URL + "/invitation-requests/design-presentations/" + item.id + "/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (token ?? "") },
        body: JSON.stringify({ action, requestedDate: dateTime ? new Date(dateTime).toISOString() : undefined, note: note.trim() || undefined }),
      });
      const payload = await response.json().catch(() => ({})) as { data?: { id: string; presentation_date?: string; presentationDate?: string; status?: string; client_note?: string; clientNote?: string }; message?: string | string[] };
      if (!response.ok || !payload.data) throw new Error(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || "Response jadwal design gagal disimpan.");
      onUpdated({ id: item.id, status: payload.data.status || action, presentationDate: payload.data.presentationDate || payload.data.presentation_date || item.presentationDate, clientNote: payload.data.clientNote || payload.data.client_note || note });
      setActive(null);
      setMode(null);
      setDateTime("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Response jadwal design gagal disimpan.");
    } finally {
      setBusyId(null);
    }
  }

  if (designs.length === 0) return null;

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Jadwal Presentasi Design</h2>
        <Badge variant="warning">{designs.length} jadwal</Badge>
      </div>
      <div className="mt-5 grid gap-4">
        {designs.map((item) => (
          <div key={item.id} className="rounded-lg border bg-[#fffdf8] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-display text-xl font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(item.presentationDate)} - {item.projectType}</p>
              </div>
              <InvitationStatusPill status={item.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-newraj-charcoal">{item.projectAddress}</p>
            {item.clientNote ? <p className="mt-3 rounded-md border bg-white px-3 py-2 text-sm text-newraj-charcoal">Catatan: {item.clientNote}</p> : null}
            {item.status === "scheduled" ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button size="sm" type="button" disabled={busyId === item.id} onClick={() => respond(item, "approve")}>Bisa Hadir</Button>
                <Button size="sm" type="button" variant="outline" onClick={() => { setActive(item); setMode("reschedule"); setDateTime(toLocalDateTimeInput(item.presentationDate)); setNote(""); }}>Reschedule</Button>
                <Button size="sm" type="button" variant="outline" onClick={() => { setActive(item); setMode("pending"); setDateTime(""); setNote(""); }}>Pending</Button>
                <Button size="sm" type="button" variant="outline" disabled={busyId === item.id} onClick={() => respond(item, "cancel")}>Batal</Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {active && mode ? (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="font-display text-2xl font-bold">{mode === "reschedule" ? "Reschedule Presentasi" : "Pending Presentasi"}</h3><p className="mt-1 text-sm text-newraj-charcoal">{mode === "reschedule" ? "Pilih jadwal baru maksimal 7 hari dari jadwal awal." : "Masukkan perkiraan waktu kapan Anda bisa memberi kepastian."}</p></div>
              <button type="button" onClick={() => { setActive(null); setMode(null); }} className="rounded-md border px-3 py-1 text-sm text-newraj-charcoal">Tutup</button>
            </div>
            {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">Waktu<input type="datetime-local" value={dateTime} min={toLocalDateTimeInput(active.presentationDate)} max={mode === "reschedule" ? toLocalDateTimeInput(addDays(active.presentationDate, 7)) : undefined} onChange={(event) => setDateTime(event.target.value)} className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" /></label>
              <label className="grid gap-2 text-sm font-semibold">Catatan<textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tulis catatan atau perkiraan waktu Anda." className="resize-none rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => { setActive(null); setMode(null); }}>Batal</Button><Button type="button" disabled={busyId === active.id} onClick={() => respond(active, mode)}>{busyId === active.id ? "Menyimpan..." : "Simpan"}</Button></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InvitationStatusPill({ status }: { status: string }) {
  if (status === "approved") return <Badge variant="success">Bisa Hadir</Badge>;
  if (status === "reschedule") return <Badge variant="warning">Reschedule</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Batal</Badge>;
  return <Badge variant="muted">Menunggu Konfirmasi</Badge>;
}

function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
function ClientInvitationDetail({ item }: { item: InvitationRequest }) {
  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{item.customerName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.projectType}</p>
        </div>
        <InvitationStatusBadge item={item} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailBox label="Nomor WhatsApp" value={item.phone} />
        <DetailBox label="Jadwal Survey" value={formatDate(item.surveyDate)} />
        <DetailBox label="Estimasi Budget" value={item.estimatedBudget} />
        <DetailBox label="Status" value={item.status === "approved" ? "Approved" : item.status} />
        <DetailBox label="Latitude" value={String(item.latitude)} />
        <DetailBox label="Longitude" value={String(item.longitude)} />
      </div>
      <div className="mt-5 rounded-lg border bg-[#fffdf8] p-5">
        <p className="text-sm font-semibold">Alamat Project</p>
        <p className="mt-2 text-sm leading-7 text-newraj-charcoal">{item.projectAddress}</p>
      </div>
      {item.notes ? (
        <div className="mt-5 rounded-lg border bg-white p-5">
          <p className="text-sm font-semibold">Catatan Project</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{item.notes}</p>
        </div>
      ) : null}
    </section>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-[#faf9f5] p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-newraj-ink">{value || "-"}</p>
    </div>
  );
}
function InvitationStatusBadge({ item }: { item: InvitationRequest }) {
  if (item.status === "approved" || item.approvedAt) {
    return <Badge variant="success">Approved</Badge>;
  }

  if (item.whatsappVerified) {
    return <Badge variant="warning">Waiting Approval</Badge>;
  }

  return <Badge variant="muted">Pending OTP</Badge>;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toTimeInputValue(value: string) {
  if (!value) return "09:00";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "09:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toApiDateTimeFromInputs(date: string, time: string) {
  const [hours = "09", minutes = "00"] = time.split(":");
  const scheduled = new Date(date);
  scheduled.setHours(Number(hours), Number(minutes), 0, 0);
  return scheduled.toISOString();
}

function safeParseUser(value: string): { id?: string; name?: string; email?: string; phone?: string; role?: string } | null {
  try {
    return JSON.parse(value) as { id?: string; name?: string; email?: string; phone?: string; role?: string };
  } catch {
    return null;
  }
}

function formatApiMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}







