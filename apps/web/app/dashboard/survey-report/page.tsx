"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CalendarDaysIcon, LinkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type SurveyReport = {
  id: string;
  photoLink?: string | null;
  videoLink?: string | null;
  measurementNotes: string;
  createdAt: string;
};

type InvitationRequest = {
  id: string;
  customerName: string;
  phone: string;
  surveyDate: string;
  projectType: string;
  projectAddress: string;
  latitude: number;
  longitude: number;
  notes?: string | null;
  surveyReports?: SurveyReport[];
};

type DashboardUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function SurveyReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfaf7] p-8 text-sm text-muted-foreground">Memuat report survey...</div>}>
      <SurveyReportContent />
    </Suspense>
  );
}

function SurveyReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("report");
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [items, setItems] = useState<InvitationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    const storedUser = window.localStorage.getItem("newraj_user");
    if (!token) {
      router.replace("/login");
      return;
    }
    const user = storedUser ? safeParseUser(storedUser) : null;
    if (user?.role !== "surveyor" && user?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setCurrentUser(user);

    async function loadItems() {
      try {
        const response = await fetch(API_BASE_URL + "/invitation-requests", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest[]; message?: string | string[] };
        if (!response.ok) {
          const message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
          throw new Error(message || "Tidak bisa memuat data survey.");
        }
        setItems(payload.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tidak bisa memuat data survey.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadItems();
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem("newraj_access_token");
    window.localStorage.removeItem("newraj_user_role");
    window.localStorage.removeItem("newraj_user");
    router.replace("/login");
  }

  const reports = useMemo(() => items.flatMap((item) => (item.surveyReports || []).map((report) => ({ ...report, client: item }))), [items]);
  const selectedReport = useMemo(() => reports.find((report) => report.id === selectedId) ?? null, [reports, selectedId]);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="Report List" user={currentUser} onLogout={handleLogout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <div className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <button className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-newraj-gold" type="button" onClick={() => router.push("/dashboard")}>
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali ke List Survey
              </button>
              <h1 className="font-display text-4xl font-bold">Report List</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Lihat daftar report survey terlebih dahulu, lalu pilih report untuk melihat detailnya.</p>
            </div>
            <Badge variant="muted">{reports.length} Report</Badge>
          </div>

          {isLoading ? <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat data survey...</p> : null}
          {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

          {!isLoading ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <aside className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold">Report List</h2>
                  <Badge variant="muted">{reports.length} report</Badge>
                </div>
                {reports.length === 0 ? (
                  <p className="mt-4 rounded-md border bg-[#faf9f5] p-4 text-sm text-muted-foreground">Belum ada report survey.</p>
                ) : (
                  <div className="mt-5 space-y-2">
                    {reports.map((report) => (
                      <button
                        className={[
                          "w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                          selectedReport?.id === report.id ? "border-newraj-gold bg-[#fffaf0]" : "bg-white hover:border-newraj-gold/60",
                        ].join(" ")}
                        key={report.id}
                        onClick={() => router.replace("/dashboard/survey-report?report=" + report.id)}
                        type="button"
                      >
                        <span className="block font-semibold">{report.client.customerName}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{formatDateTime(report.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </aside>

              <section className="rounded-lg border bg-white p-6 shadow-sm">
                {selectedReport ? (
                  <div>
                    <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Detail Report</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold">{selectedReport.client.customerName}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedReport.client.projectType}</p>
                      </div>
                      <Badge variant="muted">{formatDateTime(selectedReport.createdAt)}</Badge>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <DetailCard label="Jadwal Survey" value={formatDateTime(selectedReport.client.surveyDate)} />
                      <DetailCard label="Nomor WhatsApp" value={selectedReport.client.phone} />
                    </div>
                    <div className="mt-5 rounded-lg border bg-[#fffdf8] p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold"><MapPinIcon className="h-5 w-5 text-newraj-gold" />Alamat Project</p>
                      <p className="mt-3 text-sm leading-7 text-newraj-charcoal">{selectedReport.client.projectAddress}</p>
                    </div>
                    <div className="mt-5 rounded-lg border bg-[#faf9f5] p-5">
                      <p className="text-sm font-semibold">Detail Pengukuran</p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{selectedReport.measurementNotes}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        {selectedReport.photoLink ? <ReportLink href={selectedReport.photoLink} label="Link Foto" /> : null}
                        {selectedReport.videoLink ? <ReportLink href={selectedReport.videoLink} label="Link Video" /> : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-md border bg-[#faf9f5] p-5 text-sm text-muted-foreground">Pilih report dari list untuk melihat detailnya.</p>
                )}
              </section>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-[#faf9f5] p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-newraj-ink">{value || "-"}</p>
    </div>
  );
}

function ReportLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="inline-flex items-center gap-2 font-semibold text-newraj-gold underline" href={href} target="_blank" rel="noreferrer">
      <LinkIcon className="h-4 w-4" />
      {label}
    </a>
  );
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

function safeParseUser(value: string): DashboardUser | null {
  try {
    return JSON.parse(value) as DashboardUser;
  } catch {
    return null;
  }
}


