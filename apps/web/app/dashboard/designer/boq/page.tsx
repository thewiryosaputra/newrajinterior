"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Boq = { id: string; project: string; customer: string; total: string; status: string; createdBy: string; updatedAt: string };
type BoqRow = { no: string; category: string; item: string; spec: string; unit: string; qty: string; price: string; total: string };

const initialBoqs: Boq[] = [
  { id: "BOQ-2505-001", project: "Modern Minimalist House", customer: "Budi Santoso", total: "Rp 450.000.000", status: "Menunggu Review", createdBy: "Designer", updatedAt: "21 Mei 2026, 14:30" },
  { id: "BOQ-2505-002", project: "Kitchen Set Premium", customer: "Maria Claudia", total: "Rp 185.000.000", status: "Draft", createdBy: "Designer", updatedAt: "22 Mei 2026, 10:15" },
  { id: "BOQ-2505-003", project: "Wardrobe & TV Panel", customer: "Andi Wijaya", total: "Rp 96.000.000", status: "Revisi", createdBy: "Designer", updatedAt: "23 Mei 2026, 09:00" },
];

const initialRows: BoqRow[] = [
  { no: "1", category: "Pekerjaan Persiapan", item: "Pembersihan Area", spec: "Pembersihan lokasi existing", unit: "m2", qty: "120", price: "Rp 15.000", total: "Rp 1.800.000" },
  { no: "1.2", category: "Pekerjaan Persiapan", item: "Proteksi Area Kerja", spec: "Penutupan lantai & perabot", unit: "m2", qty: "120", price: "Rp 12.000", total: "Rp 1.440.000" },
  { no: "2", category: "Pekerjaan Sipil", item: "Pasangan Dinding", spec: "Bata ringan tebal 10cm", unit: "m2", qty: "45", price: "Rp 120.000", total: "Rp 5.400.000" },
  { no: "2.2", category: "Pekerjaan Sipil", item: "Flooring", spec: "Homogeneous Tile 60x60", unit: "m2", qty: "120", price: "Rp 180.000", total: "Rp 21.600.000" },
  { no: "2.3", category: "Pekerjaan Sipil", item: "Plafond", spec: "Gypsum board 9mm", unit: "m2", qty: "120", price: "Rp 110.000", total: "Rp 13.200.000" },
  { no: "2.5", category: "Pekerjaan Sipil", item: "Waterproofing", spec: "Kamar mandi & area basah", unit: "m2", qty: "8", price: "Rp 150.000", total: "Rp 1.200.000" },
];

export default function DesignerBoqPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [boqs, setBoqs] = useState(initialBoqs);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rows, setRows] = useState(initialRows);
  const [isEditing, setIsEditing] = useState(false);
  const selected = useMemo(() => boqs.find((boq) => boq.id === selectedId) ?? null, [boqs, selectedId]);

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

  function updateSelected(field: keyof Boq, value: string) {
    if (!selected) return;
    setBoqs((current) => current.map((boq) => boq.id === selected.id ? { ...boq, [field]: value, updatedAt: "Baru saja" } : boq));
  }

  function addRow() {
    const nextNo = String(rows.length + 1);
    setRows((current) => [
      ...current,
      {
        no: nextNo,
        category: "Kategori Baru",
        item: "Item Baru",
        spec: "Spesifikasi item",
        unit: "pcs",
        qty: "1",
        price: "Rp 0",
        total: "Rp 0",
      },
    ]);
    setIsEditing(true);
  }

  function updateRow(index: number, field: keyof BoqRow, value: string) {
    setRows((current) => current.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const nextRow = { ...row, [field]: value };
      if (field === "qty" || field === "price") {
        nextRow.total = formatRupiah(parseNumber(nextRow.qty) * parseRupiah(nextRow.price));
      }
      return nextRow;
    }));
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="BOQ" user={user} onLogout={logout} />
        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-3 border-b pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">BOQ</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Masuk dari list BOQ terlebih dahulu, lalu pilih salah satu untuk melihat detail dan edit inline.</p>
            </div>
            <Button><PlusIcon className="h-5 w-5" />Tambah BOQ</Button>
          </header>

          {!selected ? (
            <section className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">List BOQ</h2>
                <Badge variant="muted">{boqs.length} BOQ</Badge>
              </div>
              <div className="mt-5 overflow-hidden rounded-lg border">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                  <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal">
                    <tr><th className="px-4 py-3">No. BOQ</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {boqs.map((boq) => (
                      <tr className="hover:bg-[#fffaf0]" key={boq.id}>
                        <td className="px-4 py-4 font-semibold">{boq.id}</td>
                        <td className="px-4 py-4">{boq.project}</td>
                        <td className="px-4 py-4 text-muted-foreground">{boq.customer}</td>
                        <td className="px-4 py-4 font-semibold">{boq.total}</td>
                        <td className="px-4 py-4"><Badge variant={boq.status === "Draft" ? "muted" : "warning"}>{boq.status}</Badge></td>
                        <td className="px-4 py-4"><Button size="sm" onClick={() => setSelectedId(boq.id)}>Lihat Detail</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 rounded-lg border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-newraj-gold" type="button" onClick={() => { setSelectedId(null); setIsEditing(false); }}>
                  <ArrowLeftIcon className="h-4 w-4" /> Kembali ke List BOQ
                </button>
                <div className="flex gap-2">
                  <Button className="bg-white text-foreground shadow-sm hover:bg-muted" variant="outline" type="button" onClick={() => setIsEditing((value) => !value)}>
                    <PencilSquareIcon className="h-5 w-5" />{isEditing ? "Selesai Edit" : "Edit BOQ"}
                  </Button>
                  <Button>Kirim untuk Review</Button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
                <section className="space-y-5">
                  <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap gap-5 border-b pb-4 text-sm font-semibold"><span className="text-newraj-gold">Ringkasan</span><span>Daftar Item</span><span>Rencana & Gambar</span><span>Catatan</span><span>Riwayat</span></div>
                    <div className="mt-6 grid gap-5 md:grid-cols-4">
                      <EditableMetric label="Total Estimasi" value={selected.total} sub="Termasuk PPN 11%" editing={isEditing} onChange={(value) => updateSelected("total", value)} />
                      <EditableMetric label="Total Material" value="Rp 285.000.000" sub="63.3%" editing={isEditing} />
                      <EditableMetric label="Total Upah" value="Rp 95.000.000" sub="21.1%" editing={isEditing} />
                      <EditableMetric label="Other Cost" value="Rp 70.000.000" sub="15.6%" editing={isEditing} />
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b p-5"><h2 className="font-display text-xl font-semibold">Daftar Item BOQ</h2><Button size="sm" type="button" onClick={addRow}><PlusIcon className="h-4 w-4" />Tambah Item</Button></div>
                    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                      <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal"><tr>{["No","Kategori","Item","Spesifikasi","Satuan","Qty","Harga Satuan","Total"].map((h)=><th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead>
                      <tbody className="divide-y bg-white">{rows.map((row, index)=><tr className="hover:bg-[#fffaf0]" key={index}>{(Object.keys(row) as Array<keyof BoqRow>).map((field)=><td className="px-4 py-3" key={field}>{isEditing ? <InlineInput value={row[field]} onChange={(value) => updateRow(index, field, value)} /> : row[field]}</td>)}</tr>)}</tbody>
                      <tfoot className="bg-[#faf9f5] font-bold"><tr><td className="px-4 py-4" colSpan={7}>TOTAL ESTIMASI</td><td className="px-4 py-4">{selected.total}</td></tr></tfoot>
                    </table>
                  </div>
                </section>
                <aside className="space-y-5">
                  <Panel title="Informasi BOQ">
                    <Info label="No. BOQ" value={selected.id} />
                    <EditableInfo label="Project" value={selected.project} editing={isEditing} onChange={(value) => updateSelected("project", value)} />
                    <EditableInfo label="Customer" value={selected.customer} editing={isEditing} onChange={(value) => updateSelected("customer", value)} />
                    <Info label="Dibuat oleh" value={selected.createdBy} />
                    <Info label="Terakhir Diubah" value={selected.updatedAt} />
                  </Panel>
                  <Panel title="File & Gambar">{["Layout Plan.png","Ruang Tamu 3D.jpg","Kitchen View.jpg"].map((name)=><div className="mb-3 flex gap-3" key={name}><div className="h-16 w-20 overflow-hidden rounded-md bg-muted"><Image src="/brand/login-interior-bg.png" alt="" width={96} height={72} className="h-full w-full object-cover" /></div><div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">2.8 MB</p></div></div>)}</Panel>
                  <Panel title="Status & Approval"><Badge variant="warning">{selected.status}</Badge><div className="mt-4 space-y-3 text-sm"><p>Dibuat - selesai</p><p>Review Manager - menunggu</p><p>Approval Client - menunggu</p></div></Panel>
                </aside>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InlineInput({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <input className="h-9 w-full min-w-24 rounded-md border bg-white px-2 text-sm outline-none focus:border-newraj-gold" value={value} onChange={(event) => onChange(event.target.value)} />; }
function EditableMetric({ label, value, sub, editing, onChange }: { label: string; value: string; sub: string; editing: boolean; onChange?: (value: string) => void }) { return <div><p className="text-sm text-muted-foreground">{label}</p>{editing && onChange ? <InlineInput value={value} onChange={onChange} /> : <p className="mt-2 font-display text-2xl font-semibold">{value}</p>}<p className="mt-1 text-xs text-muted-foreground">{sub}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="font-display text-xl font-semibold">{title}</h3><div className="mt-4">{children}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="mb-3 flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span><b className="text-right">{value}</b></div>; }
function EditableInfo({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (value: string) => void }) { return <div className="mb-3 text-sm"><span className="text-muted-foreground">{label}</span>{editing ? <div className="mt-2"><InlineInput value={value} onChange={onChange} /></div> : <b className="float-right max-w-40 text-right">{value}</b>}</div>; }

function parseNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.,-]/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRupiah(value: string) {
  const parsed = Number(value.replace(/[^0-9-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value).replace(/\s/g, " ");
}
