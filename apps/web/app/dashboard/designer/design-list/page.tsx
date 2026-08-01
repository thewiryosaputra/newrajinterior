"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "https://api.newrajinterior.xyz/api";

type User = { name?: string; role?: string };
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

export default function DesignerDesignListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<DesignPresentation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0] ?? null, [items, selectedId]);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    const stored = window.localStorage.getItem("newraj_user");
    if (!token) return router.replace("/login");
    const parsed = stored ? JSON.parse(stored) as User : null;
    if (parsed?.role !== "designer" && parsed?.role !== "admin") return router.replace("/dashboard");
    setUser(parsed);
    fetch(API_BASE_URL + "/invitation-requests/design-presentations", { cache: "no-store", headers: { Authorization: "Bearer " + token } })
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
        <DashboardSidebar activeItem="Design List" user={user} onLogout={logout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Design List</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Jadwal presentasi design yang sudah dikirim ke client.</p>
            </div>
            <Badge variant="warning">{items.length} Jadwal Design</Badge>
          </header>

          {loading ? <p className="mt-6 rounded-lg border bg-white p-5 text-sm text-muted-foreground">Memuat design list...</p> : null}
          {!loading ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-white p-5 shadow-sm">
                <h2 className="font-display text-2xl font-semibold">Antrian Design</h2>
                <div className="mt-5 space-y-2">
                  {items.map((item) => (
                    <button key={item.id} onClick={() => setSelectedId(item.id)} className={["w-full rounded-md border px-4 py-3 text-left text-sm", selected?.id === item.id ? "border-newraj-gold bg-[#fffaf0]" : "bg-white hover:border-newraj-gold/60"].join(" ")} type="button">
                      <span className="block font-semibold">{item.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{item.customerName} - {formatDateTime(item.presentationDate)}</span>
                      <span className="mt-2 inline-flex"><StatusBadge status={item.status} /></span>
                    </button>
                  ))}
                  {items.length === 0 ? <p className="rounded-md border bg-[#faf9f5] p-4 text-sm text-muted-foreground">Belum ada jadwal design.</p> : null}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                {selected ? (
                  <>
                    <div className="border-b pb-5">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Detail Design</p>
                      <h2 className="mt-2 font-display text-3xl font-semibold">{selected.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{selected.customerName} - {selected.projectType}</p>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <Info icon={CalendarDaysIcon} label="Jadwal Presentasi" value={formatDateTime(selected.presentationDate)} />
                      <Info icon={PhoneIcon} label="WhatsApp" value={selected.phone} />
                      <Info icon={MapPinIcon} label="Alamat" value={selected.projectAddress} wide />
                      <Info icon={CalendarDaysIcon} label="Status Client" value={statusLabel(selected.status)} />
                    </div>
                    {selected.clientNote ? <div className="mt-5 rounded-lg border bg-[#fffdf8] p-5"><p className="text-sm font-semibold">Catatan Client</p><p className="mt-2 whitespace-pre-line text-sm leading-7 text-newraj-charcoal">{selected.clientNote}</p></div> : null}
                  </>
                ) : <p className="text-sm text-muted-foreground">Pilih salah satu jadwal design.</p>}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge variant="success">Client Bisa</Badge>;
  if (status === "reschedule") return <Badge variant="warning">Reschedule</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Batal</Badge>;
  return <Badge variant="muted">Menunggu Client</Badge>;
}

function statusLabel(status: string) {
  if (status === "approved") return "Client bisa hadir";
  if (status === "reschedule") return "Client minta reschedule";
  if (status === "pending") return "Client pending dan memberi perkiraan waktu";
  if (status === "cancelled") return "Project batal";
  return "Menunggu response client";
}

function Info({ icon: Icon, label, value, wide }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string; wide?: boolean }) {
  return <div className={["rounded-lg border bg-[#faf9f5] p-4", wide ? "md:col-span-2" : ""].join(" ")}><p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Icon className="h-4 w-4 text-newraj-gold" />{label}</p><p className="mt-2 text-sm font-semibold leading-6">{value || "-"}</p></div>;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
