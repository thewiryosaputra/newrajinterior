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
            onRescheduled={(updated) => setInvitations((current) => current.map((item) => item.id === updated.id ? updated : item))}
          />
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
            <div className="mt-6">
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
  onRescheduled,
}: {
  invitations: InvitationRequest[];
  isLoading: boolean;
  error: string | null;
  surveyorName: string;
  onRescheduled: (updated: InvitationRequest) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = invitations.find((item) => item.id === selectedId) ?? invitations[0] ?? null;

  useEffect(() => {
    if (!selectedId && invitations[0]) setSelectedId(invitations[0].id);
  }, [invitations, selectedId]);

  return (
    <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
      <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Dashboard Surveyor</h1>
          <p className="mt-2 text-sm text-newraj-charcoal">Selamat datang, {surveyorName}. Berikut client approved yang perlu disurvey.</p>
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
        <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
          <div className="space-y-3">
            {invitations.map((item) => (
              <button
                className={[
                  "w-full rounded-lg border bg-white p-5 text-left shadow-sm transition-colors",
                  selected?.id === item.id ? "border-newraj-gold bg-[#fffaf0]" : "hover:border-newraj-gold/60",
                ].join(" ")}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.customerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.projectType}</p>
                  </div>
                  <Badge variant="success">Approved</Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-newraj-charcoal">
                  <span className="flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4 text-newraj-gold" />{formatDateTime(item.surveyDate)}</span>
                  <span className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-newraj-gold" />{item.projectAddress}</span>
                </div>
              </button>
            ))}
          </div>

          {selected ? <SurveyDetail item={selected} onRescheduled={onRescheduled} /> : null}
        </div>
      )}
    </section>
  );
}

function SurveyDetail({ item, onRescheduled }: { item: InvitationRequest; onRescheduled: (updated: InvitationRequest) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const position = { lat: item.latitude, lng: item.longitude };
  const googleMapsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + item.latitude + "," + item.longitude + "&travelmode=driving";

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold">{item.customerName}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.projectType}</p>
        </div>
<div className="flex flex-col gap-3 sm:flex-row">
          <Button className="h-11 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
            <CalendarDaysIcon className="h-5 w-5" />
            Ubah Jadwal
          </Button>
          <Button asChild className="h-11">
            <a href={googleMapsUrl} target="_blank" rel="noreferrer">
              <MapPinIcon className="h-5 w-5" />
              Navigasikan ke Google
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailBox label="Nomor WhatsApp" value={item.phone} />
        <DetailBox label="Tanggal & Waktu" value={formatDateTime(item.surveyDate)} />
        <DetailBox label="Latitude" value={String(item.latitude)} />
        <DetailBox label="Longitude" value={String(item.longitude)} />
      </div>

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
            onRescheduled(updated);
            setIsModalOpen(false);
          }}
        />
      ) : null}
    </section>
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
  const [reason, setReason] = useState(item.surveyRescheduleNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const token = window.localStorage.getItem("newraj_access_token");
      const response = await fetch(`${API_BASE_URL}/invitation-requests/${item.id}/reschedule-survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          surveyDate: toApiDateTimeFromInputs(date, time),
          reason: reason.trim(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest; message?: string | string[] };
      if (!response.ok || !payload.data) {
        setError(formatApiMessage(payload.message) || "Jadwal gagal diubah.");
        return;
      }
      onSuccess(payload.data);
    } catch (err) {
      setError("Tidak bisa terhubung ke API jadwal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true">
      <form className="w-full max-w-xl rounded-lg border bg-white p-6 shadow-soft" onSubmit={submitReschedule}>
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="font-display text-2xl font-semibold">Ubah Jadwal Survey</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.customerName}</p>
          </div>
          <button className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted" type="button" onClick={onClose}>Batal</button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold" htmlFor="reschedule-date">Tanggal</label>
            <input id="reschedule-date" className="mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="reschedule-time">Waktu</label>
            <input id="reschedule-time" className="mt-2 h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold" htmlFor="reschedule-reason">Alasan atau Catatan</label>
          <textarea id="reschedule-reason" className="mt-2 min-h-28 w-full resize-none rounded-md border px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Contoh: Surveyor perlu menyesuaikan jadwal kunjungan karena agenda lapangan." value={reason} onChange={(event) => setReason(event.target.value)} required />
        </div>

        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="h-12 flex-1" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan & Kirim Notifikasi"}
          </Button>
          <Button className="h-12 flex-1 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
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