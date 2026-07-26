import Image from "next/image";
import { BriefcaseIcon, CalendarDaysIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, Cog6ToothIcon, EllipsisVerticalIcon, EnvelopeIcon, HomeIcon, MagnifyingGlassIcon, MapPinIcon, PhoneIcon, SparklesIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const colors = [
  { name: "Luxury Gold", hex: "#d4af37", className: "bg-[#d4af37]" },
  { name: "Rich Black", hex: "#111111", className: "bg-[#111111]" },
  { name: "Ivory White", hex: "#fffdf8", className: "bg-[#fffdf8]" },
  { name: "Graphite", hex: "#374151", className: "bg-[#374151]" },
  { name: "Soft Linen", hex: "#f3f0e8", className: "bg-[#f3f0e8]" },
  { name: "Forest Accent", hex: "#176b52", className: "bg-[#176b52]" },
];

const icons = [HomeIcon, BriefcaseIcon, ClipboardDocumentListIcon, CalendarDaysIcon, UserGroupIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, MagnifyingGlassIcon, MapPinIcon, ChartBarIcon];
const projects = [["Villa Kencana", "Budi Santoso", "Dalam Proses", "65%", "15 Jan 2027"], ["Apartemen Pakuwon", "Sinta Amelia", "Selesai", "100%", "12 Feb 2027"], ["Rumah Ibu Linda", "Rizky Pratama", "Dalam Antrian", "20%", "30 Mar 2027"]];
const dashboardCards: Array<[string, string, typeof ClipboardDocumentListIcon]> = [["Total Project", "24", ClipboardDocumentListIcon], ["Client Aktif", "18", UserGroupIcon], ["Pendapatan", "Rp 2,84M", ChartBarIcon]];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="bg-[#070908] px-6 py-8 text-white lg:min-h-screen">
          <div className="flex flex-col gap-8">
            <Image src="/brand/newraj-logo-master.png" alt="New Raj Interior" width={180} height={180} className="mx-auto h-40 w-40 rounded-full object-contain" priority />
            <div><h1 className="font-display text-3xl font-bold">Design System</h1><p className="mt-4 text-sm leading-6 text-white/72">Panduan visual untuk New Raj Interior Management System yang elegan, konsisten, dan siap menjadi fondasi CRM.</p></div>
            <div className="h-px w-12 bg-newraj-gold" />
            {["Profesional", "Konsisten", "Minimalis", "Fungsional"].map((item) => <div className="flex gap-3" key={item}><SparklesIcon className="mt-1 h-5 w-5 shrink-0 text-newraj-gold" /><div><p className="font-semibold">{item}</p><p className="mt-1 text-sm leading-6 text-white/68">Elemen dirancang untuk kerja CRM yang cepat, jelas, dan premium.</p></div></div>)}
            <div className="rounded-lg border border-newraj-gold/45 p-4"><p className="text-xs font-semibold uppercase text-newraj-gold">Brand Personality</p><div className="mt-4 flex flex-wrap gap-2">{["Elegan", "Terpercaya", "Modern"].map((item) => <span className="rounded-md border border-newraj-gold/50 px-3 py-1 text-xs text-newraj-gold" key={item}>{item}</span>)}</div></div>
          </div>
        </aside>
        <section className="px-5 py-8 lg:px-10">
          <header className="mb-7 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold uppercase text-newraj-gold">UI/UX Design System</p><h2 className="font-display text-4xl font-bold text-newraj-ink">New Raj Interior CRM</h2><p className="mt-2 text-muted-foreground">Web application foundation dengan Tailwind, shadcn-style UI, dan Heroicons.</p></div><Image src="/brand/newraj-logo-master.png" alt="New Raj" width={54} height={54} className="h-14 w-14 rounded-full object-cover" /></header>
          <div className="grid gap-4 xl:grid-cols-4">
            <Card className="xl:col-span-2"><CardHeader><CardTitle>Color Palette</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{colors.map((color) => <div key={color.hex}><div className={"h-16 rounded-md border " + color.className} /><p className="mt-2 text-sm font-semibold">{color.name}</p><p className="text-xs text-muted-foreground">{color.hex}</p></div>)}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Typography</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-end gap-4"><span className="font-display text-6xl">Aa</span><div><p className="font-semibold">Playfair Display</p><p className="text-sm text-muted-foreground">Heading font</p></div></div><div className="flex items-end gap-4"><span className="text-5xl font-semibold">Aa</span><div><p className="font-semibold">Inter</p><p className="text-sm text-muted-foreground">Body font</p></div></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Buttons</CardTitle></CardHeader><CardContent className="space-y-3"><Button>Primary Button</Button><Button variant="outline">Outline Button</Button><Button variant="secondary">Secondary Button</Button><Button variant="ghost">Ghost Button</Button></CardContent></Card>
            <Card><CardHeader><CardTitle>Input Fields</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Nama customer" /><Input placeholder="Email customer" /><div className="relative"><Input placeholder="Search project..." className="pl-10" /><MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
            <Card className="xl:col-span-2"><CardHeader><CardTitle>Heroicons</CardTitle></CardHeader><CardContent><div className="grid grid-cols-6 gap-3 sm:grid-cols-9">{icons.map((Icon, index) => <button className="flex h-10 w-10 items-center justify-center rounded-md border bg-white text-newraj-charcoal transition-colors hover:border-primary hover:text-primary" key={index} title="Heroicon"><Icon className="h-5 w-5" /></button>)}</div></CardContent></Card>
            <Card className="xl:col-span-2"><CardHeader><CardTitle>Components</CardTitle></CardHeader><CardContent className="space-y-5"><div className="flex flex-wrap gap-2"><Badge>Aktif</Badge><Badge variant="warning">Dalam Proses</Badge><Badge variant="success">Selesai</Badge><Badge variant="muted">Tertunda</Badge></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><HomeIcon className="h-4 w-4" /><span>Project</span><span>/</span><span className="text-foreground">Detail Project</span></div></CardContent></Card>
            <Card className="xl:col-span-2"><CardHeader><CardTitle>Dashboard Cards</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">{dashboardCards.map(([label, value, Icon]) => <div className="rounded-lg border bg-white p-5 shadow-sm last:bg-[#101010] last:text-white" key={label as string}><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary"><Icon className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-4 text-sm text-emerald-600">Naik 12% dari bulan lalu</p></div>)}</CardContent></Card>
            <Card className="xl:col-span-4"><CardHeader><CardTitle>Project Table</CardTitle></CardHeader><CardContent><div className="overflow-hidden rounded-lg border"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Deadline</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y bg-white">{projects.map(([project, client, status, progress, deadline]) => <tr className="hover:bg-accent/45" key={project}><td className="px-4 py-3 font-semibold">{project}</td><td className="px-4 py-3">{client}</td><td className="px-4 py-3"><Badge variant={status === "Selesai" ? "success" : status === "Dalam Proses" ? "warning" : "muted"}>{status}</Badge></td><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-2 w-28 rounded-full bg-muted"><div className="h-full rounded-full bg-newraj-gold" style={{ width: progress }} /></div>{progress}</div></td><td className="px-4 py-3">{deadline}</td><td className="px-4 py-3"><Button size="icon" variant="ghost" title="Aksi"><EllipsisVerticalIcon className="h-5 w-5" /></Button></td></tr>)}</tbody></table></div></CardContent></Card>
          </div>
        </section>
      </div>
    </main>
  );
}
