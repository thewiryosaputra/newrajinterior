"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
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
  const selectedId = searchParams.get("id");
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [items, setItems] = useState<InvitationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoLink, setPhotoLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [measurementNotes, setMeasurementNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0] ?? null, [items, selectedId]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setError("");
    setSubmitMessage("");
    setIsSubmitting(true);
    try {
      const token = window.localStorage.getItem("newraj_access_token");
      const response = await fetch(API_BASE_URL + "/invitation-requests/" + selected.id + "/survey-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (token ?? ""),
        },
        body: JSON.stringify({ photoLink, videoLink, measurementNotes }),
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: InvitationRequest; message?: string | string[] };
      if (!response.ok || !payload.data) {
        const message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
        throw new Error(message || "Report survey gagal disimpan.");
      }
      setItems((current) => current.map((item) => (item.id === payload.data?.id ? payload.data : item)));
      setPhotoLink("");
      setVideoLink("");
      setMeasurementNotes("");
      setSubmitMessage("Report survey berhasil disimpan dan masuk ke Report List.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report survey gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="Survey" user={currentUser} onLogout={handleLogout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <div className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <button className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-newraj-gold" type="button" onClick={() => router.push("/dashboard")}>
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali ke List Survey
              </button>
              <h1 className="font-display text-4xl font-bold">Report Survey</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Input hasil dokumentasi dan pengukuran survey, lalu pantau report yang sudah tersimpan.</p>
            </div>
            <Badge variant="muted">{items.length} Client Survey</Badge>
          </div>

          {isLoading ? <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat data survey...</p> : null}
          {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

          {!isLoading && selected ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
              <aside className="space-y-4">
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Client Terpilih</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">{selected.customerName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.projectType}</p>
                  <div className="mt-5 space-y-3 text-sm text-newraj-charcoal">
                    <p className="flex gap-2"><CalendarDaysIcon className="h-5 w-5 text-newraj-gold" />{formatDateTime(selected.surveyDate)}</p>
                    <p className="flex gap-2"><MapPinIcon className="h-5 w-5 text-newraj-gold" />{selected.projectAddress}</p>
                  </div>
                </div>

                <div className="rounded-lg border bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold">Pilih Client Lain</p>
                  <div className="mt-4 space-y-2">
                    {items.map((item) => (
                      <button
                        className={[
                          "w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                          item.id === selected.id ? "border-newraj-gold bg-[#fffaf0]" : "bg-white hover:border-newraj-gold/60",
                        ].join(" ")}
                        key={item.id}
                        onClick={() => router.replace("/dashboard/survey-report?id=" + item.id)}
                        type="button"
                      >
                        <span className="block font-semibold">{item.customerName}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{item.surveyReports?.length || 0} report</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="font-display text-2xl font-semibold">Input Report</h2>
                  <p className="mt-1 text-sm text-newraj-charcoal">Masukkan link foto/video dan detail pengukuran dari kunjungan survey.</p>
                  {submitMessage ? <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{submitMessage}</div> : null}
                  <div className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold">
                      Link Foto
                      <input value={photoLink} onChange={(event) => setPhotoLink(event.target.value)} placeholder="https://drive.google.com/..." className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Link Video
                      <input value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="https://drive.google.com/..." className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">
                      Detail Pengukuran
                      <textarea value={measurementNotes} onChange={(event) => setMeasurementNotes(event.target.value)} rows={7} required placeholder="Catatan ukuran, kondisi lokasi, kebutuhan material, akses, dan hal penting lain." className="resize-none rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" />
                    </label>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Report"}</Button>
                  </div>
                </form>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-semibold">Report List</h2>
                    <Badge variant="muted">{selected.surveyReports?.length || 0} report</Badge>
                  </div>
                  {(selected.surveyReports || []).length === 0 ? (
                    <p className="mt-4 rounded-md border bg-[#faf9f5] p-4 text-sm text-muted-foreground">Belum ada report untuk client ini.</p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {(selected.surveyReports || []).map((report) => (
                        <article key={report.id} className="rounded-lg border bg-[#faf9f5] p-5">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">{formatDateTime(report.createdAt)}</p>
                          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{report.measurementNotes}</p>
                          <div className="mt-4 flex flex-wrap gap-3 text-sm">
                            {report.photoLink ? <ReportLink href={report.photoLink} label="Link Foto" /> : null}
                            {report.videoLink ? <ReportLink href={report.videoLink} label="Link Video" /> : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
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

