"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, LinkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type Report = { id: string; photoLink?: string | null; videoLink?: string | null; measurementNotes: string; createdAt: string };
type RequestItem = { id: string; customerName: string; phone: string; surveyDate: string; projectType: string; projectAddress: string; surveyReports?: Report[] };
type ReportItem = Report & { client: RequestItem };
type User = { name?: string; role?: string };

export default function DesignerReportListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [designReport, setDesignReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const reports = useMemo(() => items.flatMap((item) => (item.surveyReports || []).map((report) => ({ ...report, client: item }))), [items]);
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    const stored = window.localStorage.getItem("newraj_user");
    if (!token) return router.replace("/login");
    const parsed = stored ? JSON.parse(stored) as User : null;
    if (parsed?.role !== "designer" && parsed?.role !== "admin") return router.replace("/dashboard");
    setUser(parsed);
    fetch(API_BASE_URL + "/invitation-requests", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => setItems(payload.data || []))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    window.localStorage.removeItem("newraj_access_token");
    window.localStorage.removeItem("newraj_user_role");
    window.localStorage.removeItem("newraj_user");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="Report List" user={user} onLogout={logout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Report List</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Report hasil survey yang siap diproses menjadi design.</p>
            </div>
            <Badge variant="warning">{reports.length} Siap Design</Badge>
          </header>
          {loading ? <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat report...</p> : null}
          {!loading ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h2 className="font-display text-2xl font-semibold">Antrian Report</h2>
                <div className="mt-5 space-y-2">
                  {reports.map((report) => (
                    <button key={report.id} onClick={() => setSelectedId(report.id)} className={["w-full rounded-md border px-4 py-3 text-left text-sm", selected?.id === report.id ? "border-newraj-gold bg-[#fffaf0]" : "bg-white hover:border-newraj-gold/60"].join(" ")} type="button">
                      <span className="block font-semibold">{report.client.customerName}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{formatDate(report.createdAt)} - {report.client.projectType}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                {selected ? (
                  <>
                    <div className="border-b pb-5">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Detail Report</p>
                      <h2 className="mt-2 font-display text-3xl font-semibold">{selected.client.customerName}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{selected.client.projectType}</p>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <Info icon={CalendarDaysIcon} label="Jadwal Survey" value={formatDate(selected.client.surveyDate)} />
                      <Info icon={MapPinIcon} label="Alamat" value={selected.client.projectAddress} />
                    </div>
                    <div className="mt-5 rounded-lg border bg-[#faf9f5] p-5">
                      <p className="text-sm font-semibold">Detail Pengukuran</p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{selected.measurementNotes}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        {selected.photoLink ? <a className="inline-flex items-center gap-2 font-semibold text-newraj-gold underline" href={selected.photoLink} target="_blank" rel="noreferrer"><LinkIcon className="h-4 w-4" />Link Foto</a> : null}
                        {selected.videoLink ? <a className="inline-flex items-center gap-2 font-semibold text-newraj-gold underline" href={selected.videoLink} target="_blank" rel="noreferrer"><LinkIcon className="h-4 w-4" />Link Video</a> : null}
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end"><Button type="button" onClick={() => setDesignReport(selected)}>Buat Design</Button></div>
                  </>
                ) : <p className="text-sm text-muted-foreground">Belum ada report survey.</p>}
              </div>
            </div>
          ) : null}
        </section>
      </div>
      {designReport ? <CreateDesignModal report={designReport} onClose={() => setDesignReport(null)} onSuccess={() => router.push("/dashboard/designer/design-list")} /> : null}
    </main>
  );
}

function CreateDesignModal({ report, onClose, onSuccess }: { report: ReportItem; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("Design " + report.client.customerName);
  const [dateTime, setDateTime] = useState(toLocalDateTimeInput(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = window.localStorage.getItem("newraj_access_token");
      const response = await fetch(API_BASE_URL + "/invitation-requests/" + report.client.id + "/design-presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (token ?? "") },
        body: JSON.stringify({ reportId: report.id, title, presentationDate: new Date(dateTime).toISOString() }),
      });
      const payload = await response.json().catch(() => ({})) as { message?: string | string[] };
      if (!response.ok) throw new Error(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || "Design gagal dibuat.");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Design gagal dibuat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Buat Design</h3>
            <p className="mt-1 text-sm text-newraj-charcoal">Client akan menerima jadwal presentasi design lewat WhatsApp.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border px-3 py-1 text-sm text-newraj-charcoal">Tutup</button>
        </div>
        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">Judul design<input value={title} onChange={(event) => setTitle(event.target.value)} required className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" /></label>
          <label className="grid gap-2 text-sm font-semibold">Perkiraan design selesai / presentasi<input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} required className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-newraj-gold" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" disabled={submitting}>{submitting ? "Menyimpan..." : "Kirim Jadwal"}</Button></div>
      </form>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string }) {
  return <div className="rounded-lg border bg-[#faf9f5] p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Icon className="h-4 w-4 text-newraj-gold" />{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
