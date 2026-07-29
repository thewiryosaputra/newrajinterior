"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightOnRectangleIcon, ArrowPathIcon, BriefcaseIcon, EyeIcon, MapPinIcon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type ProspectRequest = {
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
  notes: string | null;
  status: string;
  emailVerified: boolean;
  whatsappVerified: boolean;
  approvedAt: string | null;
  userId: string | null;
  createdAt: string;
};

type DashboardUser = { name?: string; email?: string; role?: string };

export default function ProspectClientPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [prospects, setProspects] = useState<ProspectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<ProspectRequest | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = window.localStorage.getItem("newraj_user");
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    setCurrentUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  async function loadProspects() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/invitation-requests`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { data?: ProspectRequest[]; message?: string | string[] };
      if (!response.ok) {
        setError(formatApiMessage(payload.message) || "Data prospect client belum bisa dimuat.");
        return;
      }

      setProspects((payload.data || []).filter((item) => item.status === "approved" || Boolean(item.approvedAt)));
    } catch (err) {
      setError("Tidak bisa terhubung ke API prospect client.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecked) return;
    void loadProspects();
  }, [authChecked]);

  function handleLogout() {
    window.localStorage.removeItem("newraj_access_token");
    window.localStorage.removeItem("newraj_user_role");
    window.localStorage.removeItem("newraj_user");
    router.replace("/login");
  }

  const totalApproved = prospects.length;
  const totalWithAccount = useMemo(() => prospects.filter((item) => Boolean(item.userId)).length, [prospects]);

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
        <DashboardSidebar activeItem="Prospect Client" user={currentUser} onLogout={handleLogout} />

        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-5 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Prospect Client</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Menampung customer yang sudah di-approve dari invitation dan siap dibuatkan project.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="h-10 gap-2 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={() => void loadProspects()}>
                <ArrowPathIcon className="h-5 w-5" />
                Refresh
              </Button>
              <Button className="h-10 gap-2 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </header>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SummaryCard label="Approved Prospect" value={String(totalApproved)} body="Client sudah disetujui admin" />
            <SummaryCard label="Akun Customer" value={String(totalWithAccount)} body="User sudah dibuat dari approval" />
            <SummaryCard label="Siap Project" value={String(totalApproved)} body="Dapat diproses menjadi project" dark />
          </div>

          <section className="mt-5 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Daftar Prospect Client</h2>
                <p className="mt-1 text-sm text-muted-foreground">Data berikut berasal dari form request invitation yang sudah approved.</p>
              </div>
            </div>

            {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}

            <div className="mt-5 overflow-hidden rounded-lg border">
              <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Kontak</th>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Survey</th>
                    <th className="px-4 py-3 font-semibold">Alamat</th>
                    <th className="px-4 py-3 font-semibold">Catatan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {isLoading ? (
                    <tr>
                      <td className="px-4 py-5 text-center text-muted-foreground" colSpan={8}>Memuat prospect client...</td>
                    </tr>
                  ) : prospects.length ? prospects.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fffaf0]">
                      <td className="px-4 py-4">
                        <div className="font-semibold">{item.customerName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Approved {formatDate(item.approvedAt || item.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        <div>{item.email}</div>
                        <div className="mt-1 flex items-center gap-1"><PhoneIcon className="h-4 w-4" />{item.phone}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{item.projectType}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.estimatedBudget}</div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{formatDate(item.surveyDate)}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        <div className="flex max-w-[300px] gap-2">
                          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-newraj-gold" />
                          <span>{item.projectAddress}</span>
                        </div>
                        <div className="mt-1 text-xs">{item.latitude}, {item.longitude}</div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        <div className="max-w-[220px] truncate">{item.notes || "-"}</div>
                      </td>
                      <td className="px-4 py-4"><Badge variant="success">Approved</Badge></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" type="button" variant="outline" onClick={() => setSelectedProspect(item)}>
                            <EyeIcon className="h-4 w-4" />
                            View Detail
                          </Button>
                          <Button size="sm" type="button" onClick={() => router.push(`/dashboard/project?prospect=${item.id}`)}>
                            <BriefcaseIcon className="h-4 w-4" />
                            Buat Project
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-4 py-5 text-center text-muted-foreground" colSpan={8}>Belum ada prospect client approved.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
      {selectedProspect ? (
        <ProspectDetailModal
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onCreateProject={() => router.push(`/dashboard/project?prospect=${selectedProspect.id}`)}
        />
      ) : null}
    </main>
  );
}


function ProspectDetailModal({ prospect, onClose, onCreateProject }: { prospect: ProspectRequest; onClose: () => void; onCreateProject: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="prospect-detail-title">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-newraj-gold">Prospect Client Detail</p>
            <h2 id="prospect-detail-title" className="mt-1 font-display text-2xl font-bold">{prospect.customerName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Approved {formatDate(prospect.approvedAt || prospect.createdAt)}</p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onClose} type="button" aria-label="Tutup detail prospect">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-154px)] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Nama Client" value={prospect.customerName} />
            <DetailItem label="Email" value={prospect.email} />
            <DetailItem label="Nomor WhatsApp" value={prospect.phone} />
            <DetailItem label="Jadwal Survey" value={formatDate(prospect.surveyDate)} />
            <DetailItem label="Tipe Project" value={prospect.projectType} />
            <DetailItem label="Estimasi Budget" value={prospect.estimatedBudget} />
            <DetailItem label="Status" value="Approved" />
            <DetailItem label="User ID" value={prospect.userId || "-"} />
          </div>

          <div className="mt-4 rounded-lg border bg-[#faf9f5] p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Alamat Project</p>
            <p className="mt-2 text-sm leading-6">{prospect.projectAddress}</p>
            <p className="mt-2 text-xs text-muted-foreground">Pin point: {prospect.latitude}, {prospect.longitude}</p>
          </div>

          <div className="mt-4 rounded-lg border bg-white p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Catatan Client</p>
            <div className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md bg-[#fbfaf7] p-4 text-sm leading-7 text-newraj-charcoal">
              {prospect.notes || "Tidak ada catatan."}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t bg-[#faf9f5] px-6 py-4 sm:flex-row sm:justify-end">
          <Button className="bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={onClose}>Tutup</Button>
          <Button type="button" onClick={onCreateProject}>
            <BriefcaseIcon className="h-4 w-4" />
            Buat Project
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-newraj-ink">{value}</p>
    </div>
  );
}
function SummaryCard({ label, value, body, dark = false }: { label: string; value: string; body: string; dark?: boolean }) {
  return (
    <div className={["rounded-lg border p-5 shadow-sm", dark ? "bg-[#101010] text-white" : "bg-white"].join(" ")}>
      <p className={dark ? "text-sm text-white/72" : "text-sm text-muted-foreground"}>{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className={dark ? "mt-3 text-sm text-white/70" : "mt-3 text-sm text-muted-foreground"}>{body}</p>
    </div>
  );
}

function safeParseUser(value: string): DashboardUser | null {
  try {
    return JSON.parse(value) as DashboardUser;
  } catch {
    return null;
  }
}

function formatApiMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
