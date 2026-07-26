import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const benefits = [
  {
    title: "Project Invitation",
    body: "Buat invitation customer dengan data project yang lengkap.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Professional Team",
    body: "Customer langsung masuk ke alur kerja New Raj Interior.",
    icon: UserGroupIcon,
  },
  {
    title: "Secure Access",
    body: "Invitation menjadi pintu awal akun customer yang aman.",
    icon: ShieldCheckIcon,
  },
];

export default function InvitationRequestPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[34%_66%]">
        <aside className="relative hidden overflow-hidden bg-[#070807] text-white lg:block">
          <Image
            src="/brand/login-interior-bg.png"
            alt="New Raj Interior invitation form"
            fill
            className="object-cover"
            sizes="34vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.62),rgba(5,5,4,0.95)),linear-gradient(90deg,rgba(5,5,4,0.74),rgba(5,5,4,0.40))]" />
          <div className="absolute -right-16 top-0 h-full w-32 rounded-l-[100%] border-l-[10px] border-newraj-gold bg-[#fbfaf7]" />
          <div className="relative z-10 flex min-h-screen flex-col px-14 py-16">
            <Image
              src="/brand/newraj-logo-master.png"
              alt="New Raj Interior"
              width={210}
              height={210}
              className="mx-auto h-52 w-52 rounded-full object-contain"
              priority
            />

            <div className="mt-10 text-center">
              <p className="font-display text-3xl tracking-[0.24em]">CREATE</p>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-[0.10em] text-newraj-gold">
                INVITATION
              </h1>
              <div className="mx-auto mt-5 h-px w-40 bg-newraj-gold" />
              <p className="mx-auto mt-8 max-w-xs text-lg leading-8 text-white/86">
                Lengkapi data customer dan project sebelum invitation dikirimkan.
              </p>
            </div>

            <div className="mt-auto space-y-7">
              {benefits.map((item) => (
                <div className="flex gap-4" key={item.title}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-newraj-gold/55 bg-black/20 text-newraj-gold">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-newraj-gold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/78">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_0%,rgba(212,175,55,0.10),transparent_28rem)]" />
          <div className="relative z-10 flex justify-end">
            <button className="flex h-12 items-center gap-3 rounded-lg border bg-white px-5 text-sm font-medium shadow-sm">
              <GlobeAltIcon className="h-5 w-5" />
              Bahasa Indonesia
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-5xl rounded-lg border bg-white/90 p-8 shadow-soft backdrop-blur sm:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-5xl font-bold">
                  Form Invitation
                </h2>
                <div className="mx-auto mt-5 flex w-36 items-center gap-3 text-newraj-gold">
                  <div className="h-px flex-1 bg-newraj-gold" />
                  <span className="h-2 w-2 rotate-45 bg-newraj-gold" />
                  <div className="h-px flex-1 bg-newraj-gold" />
                </div>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Isi data awal customer dan project. Setelah lengkap, sistem
                  akan menampilkan halaman invitation untuk customer.
                </p>
              </div>

              <form className="mt-10 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    id="customer-name"
                    label="Nama Customer"
                    placeholder="Contoh: Dian"
                    icon={UserIcon}
                  />
                  <Field
                    id="phone"
                    label="Nomor Telepon"
                    placeholder="Contoh: 081238979785"
                    icon={PhoneIcon}
                  />
                  <Field
                    id="email"
                    label="Email"
                    placeholder="customer@email.com"
                    icon={EnvelopeIcon}
                  />
                  <Field
                    id="survey-date"
                    label="Jadwal Survey"
                    placeholder="Pilih tanggal survey"
                    icon={CalendarDaysIcon}
                  />
                </div>

                <Field
                  id="address"
                  label="Alamat Project"
                  placeholder="Contoh: Jln. Dukuh Indah 15, Kerobokan."
                  icon={MapPinIcon}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectLike label="Tipe Project" value="Kitchen Set" />
                  <SelectLike label="Estimasi Budget" value="Rp 50 juta - Rp 100 juta" />
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="notes">
                    Catatan Project
                  </label>
                  <textarea
                    id="notes"
                    className="mt-3 min-h-28 w-full resize-none rounded-md border border-input bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Tulis kebutuhan awal customer, ukuran area, preferensi material, atau request khusus."
                  />
                </div>

                <div className="rounded-lg border border-newraj-gold/35 bg-[#fff8e8] p-5">
                  <p className="font-semibold">Preview invitation</p>
                  <p className="mt-2 text-sm leading-7 text-newraj-charcoal">
                    Data ini akan dipakai untuk membuat undangan project customer.
                    Nanti backend akan menyimpan data dan membuat invitation link
                    unik.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="h-14 flex-1 text-base uppercase" asChild>
                    <Link href="/invitation">
                      Generate Invitation
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    className="h-14 flex-1 bg-white text-foreground shadow-sm hover:bg-muted"
                    variant="outline"
                    type="button"
                  >
                    Save Draft
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <p className="relative z-10 pb-4 text-center text-sm text-muted-foreground">
            © 2026 New Raj Interior. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  placeholder,
  icon: Icon,
}: {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-3">
        <Icon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <Input id={id} className="h-12 pl-12" placeholder={placeholder} />
      </div>
    </div>
  );
}

function SelectLike({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <button
        className="mt-3 flex h-12 w-full items-center justify-between rounded-md border border-input bg-white px-4 text-left text-sm shadow-sm"
        type="button"
      >
        <span className="flex items-center gap-3">
          <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
          {value}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
