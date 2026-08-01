"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const boqs = [
  { id: "BOQ-2505-001", project: "Modern Minimalist House", customer: "Budi Santoso", total: "Rp 450.000.000", status: "Menunggu Review" },
  { id: "BOQ-2505-002", project: "Kitchen Set Premium", customer: "Maria Claudia", total: "Rp 185.000.000", status: "Draft" },
  { id: "BOQ-2505-003", project: "Wardrobe & TV Panel", customer: "Andi Wijaya", total: "Rp 96.000.000", status: "Revisi" },
];

const rows = [
  ["1", "Pekerjaan Persiapan", "Pembersihan Area", "Pembersihan lokasi existing", "m2", "120", "Rp 15.000", "Rp 1.800.000"],
  ["1.2", "Pekerjaan Persiapan", "Proteksi Area Kerja", "Penutupan lantai & perabot", "m2", "120", "Rp 12.000", "Rp 1.440.000"],
  ["2", "Pekerjaan Sipil", "Pasangan Dinding", "Bata ringan tebal 10cm", "m2", "45", "Rp 120.000", "Rp 5.400.000"],
  ["2.2", "Pekerjaan Sipil", "Flooring", "Homogeneous Tile 60x60", "m2", "120", "Rp 180.000", "Rp 21.600.000"],
  ["2.3", "Pekerjaan Sipil", "Plafond", "Gypsum board 9mm", "m2", "120", "Rp 110.000", "Rp 13.200.000"],
  ["2.5", "Pekerjaan Sipil", "Waterproofing", "Kamar mandi & area basah", "m2", "8", "Rp 150.000", "Rp 1.200.000"],
];

export default function DesignerBoqPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [selected, setSelected] = useState(boqs[0]);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    const stored = window.localStorage.getItem("newraj_user");
    if (!token) return router.replace("/login");
    const parsed = stored ? JSON.parse(stored) as { name?: string; role?: string } : null;
    if (parsed?.role !== "designer" && parsed?.role !== "admin") return router.replace("/dashboard");
    setUser(parsed);
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
        <DashboardSidebar activeItem="BOQ" user={user} onLogout={logout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">BOQ</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">List BOQ terlebih dahulu, pilih salah satu untuk melihat detail dan konten design.</p>
            </div>
            <Button><PlusIcon className="h-5 w-5" />Tambah BOQ</Button>
          </header>

          <div className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border bg-white p-5 shadow-sm">
              <h2 className="font-display text-2xl font-semibold">List BOQ</h2>
              <div className="mt-5 space-y-2">
                {boqs.map((boq) => (
                  <button key={boq.id} type="button" onClick={() => setSelected(boq)} className={["w-full rounded-md border p-4 text-left text-sm", selected.id === boq.id ? "border-newraj-gold bg-[#fffaf0]" : "hover:border-newraj-gold/60"].join(" ")}>
                    <span className="block font-semibold">{boq.id}</span>
                    <span className="mt-1 block text-muted-foreground">{boq.project}</span>
                    <span className="mt-3 flex items-center justify-between"><Badge variant={boq.status === "Draft" ? "muted" : "warning"}>{boq.status}</Badge><b>{boq.total}</b></span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
              <section className="space-y-5">
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex gap-5 text-sm font-semibold"><span className="text-newraj-gold">Ringkasan</span><span>Daftar Item</span><span>Rencana & Gambar</span><span>Catatan</span><span>Riwayat</span></div>
                    <Button size="sm"><PencilSquareIcon className="h-4 w-4" />Edit BOQ</Button>
                  </div>
                  <div className="mt-6 grid gap-5 md:grid-cols-4">
                    <Metric label="Total Estimasi" value={selected.total} sub="Termasuk PPN 11%" />
                    <Metric label="Total Material" value="Rp 285.000.000" sub="63.3%" />
                    <Metric label="Total Upah" value="Rp 95.000.000" sub="21.1%" />
                    <Metric label="Other Cost" value="Rp 70.000.000" sub="15.6%" />
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b p-5"><h2 className="font-display text-xl font-semibold">Daftar Item BOQ</h2><Button size="sm"><PlusIcon className="h-4 w-4" />Tambah Item</Button></div>
                  <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal"><tr>{["No","Kategori","Item","Spesifikasi","Satuan","Qty","Harga Satuan","Total"].map((h)=><th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead>
                    <tbody className="divide-y bg-white">{rows.map((row)=><tr className="hover:bg-[#fffaf0]" key={row.join("-")}>{row.map((cell)=><td className="px-4 py-3" key={cell}>{cell}</td>)}</tr>)}</tbody>
                    <tfoot className="bg-[#faf9f5] font-bold"><tr><td className="px-4 py-4" colSpan={7}>TOTAL ESTIMASI</td><td className="px-4 py-4">{selected.total}</td></tr></tfoot>
                  </table>
                </div>
              </section>
              <aside className="space-y-5">
                <Panel title="Informasi BOQ"><Info label="No. BOQ" value={selected.id} /><Info label="Project" value={selected.project} /><Info label="Customer" value={selected.customer} /><Info label="Dibuat oleh" value="Designer" /></Panel>
                <Panel title="File & Gambar">{["Layout Plan.png","Ruang Tamu 3D.jpg","Kitchen View.jpg"].map((name)=><div className="mb-3 flex gap-3" key={name}><div className="h-16 w-20 overflow-hidden rounded-md bg-muted"><Image src="/brand/login-interior-bg.png" alt="" width={96} height={72} className="h-full w-full object-cover" /></div><div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">2.8 MB</p></div></div>)}</Panel>
                <Panel title="Status & Approval"><Badge variant="warning">{selected.status}</Badge><div className="mt-4 space-y-3 text-sm"><p>Dibuat - selesai</p><p>Review Manager - menunggu</p><p>Approval Client - menunggu</p></div><Button className="mt-5 w-full">Kirim untuk Review</Button></Panel>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) { return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="font-display text-xl font-semibold">{title}</h3><div className="mt-4">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="mb-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span><b className="text-right">{value}</b></div>; }
