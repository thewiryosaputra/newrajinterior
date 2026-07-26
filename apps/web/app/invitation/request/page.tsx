"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LocationMap = dynamic(
  () => import("@/components/invitation-location-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg bg-[#f8f4ea] text-sm text-muted-foreground">
        Memuat peta...
      </div>
    ),
  },
);

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

const projectTypes = [
  "Kitchen Set",
  "Bathroom Cabinet",
  "Wardrobe",
  "Living Room",
  "Bedroom Interior",
  "Office Interior",
  "Full Interior Package",
];

const budgetRanges = [
  "Di bawah Rp 25 juta",
  "Rp 25 juta - Rp 50 juta",
  "Rp 50 juta - Rp 100 juta",
  "Rp 100 juta - Rp 250 juta",
  "Di atas Rp 250 juta",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const defaultPosition = { lat: -6.175392, lng: 106.827153 };

type AddressSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
  };
};

export default function InvitationRequestPage() {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [shouldSearchAddress, setShouldSearchAddress] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 28));
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 6, 1));
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [budget, setBudget] = useState(budgetRanges[2]);

  useEffect(() => {
    if (!shouldSearchAddress || address.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: address,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          countrycodes: "id",
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as AddressSuggestion[];
        setSuggestions(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address, shouldSearchAddress]);

  function selectAddress(item: AddressSuggestion) {
    setShouldSearchAddress(false);
    setAddress(item.display_name);
    setPosition({ lat: Number(item.lat), lng: Number(item.lon) });
    setSuggestions([]);
  }

  async function updatePositionFromMap(nextPosition: { lat: number; lng: number }) {
    setPosition(nextPosition);
    setSuggestions([]);
    setShouldSearchAddress(false);
    setIsReverseGeocoding(true);

    try {
      const params = new URLSearchParams({
        lat: String(nextPosition.lat),
        lon: String(nextPosition.lng),
        format: "jsonv2",
        addressdetails: "1",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      );
      const data = (await response.json()) as Partial<AddressSuggestion>;

      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      setAddress(`Pin point: ${nextPosition.lat.toFixed(6)}, ${nextPosition.lng.toFixed(6)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }

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
                Lengkapi data customer, jadwal survey, dan pin point project
                sebelum invitation dikirimkan.
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
                  Isi data awal customer, project, alamat lengkap, dan jadwal
                  survey. Setelah lengkap, sistem akan menampilkan halaman
                  invitation untuk customer.
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
                  <DatePicker
                    value={selectedDate}
                    calendarMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onChange={setSelectedDate}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    icon={BriefcaseIcon}
                    label="Tipe Project"
                    value={projectType}
                    options={projectTypes}
                    onChange={setProjectType}
                  />
                  <SelectField
                    icon={CurrencyDollarIcon}
                    label="Estimasi Budget"
                    value={budget}
                    options={budgetRanges}
                    onChange={setBudget}
                  />
                </div>

                <div className="rounded-lg border border-newraj-gold/25 bg-[#fffdf8] p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-[#b87900]">
                      <MapIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Pin Point Alamat Project</p>
                      <p className="text-sm text-muted-foreground">
                        Ketik alamat, pilih suggestion, lalu geser pin bila perlu.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                      <AddressAutocomplete
                        address={address}
                        isSearching={isSearching}
                        suggestions={suggestions}
                        isReverseGeocoding={isReverseGeocoding}
                        onAddressChange={(value) => {
                          setShouldSearchAddress(true);
                          setAddress(value);
                        }}
                        onSelectAddress={selectAddress}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <ReadOnlyValue label="Latitude" value={position.lat.toFixed(6)} />
                        <ReadOnlyValue label="Longitude" value={position.lng.toFixed(6)} />
                      </div>

                      <p className="rounded-lg border border-newraj-gold/30 bg-[#fff8e8] p-4 text-sm leading-7 text-newraj-charcoal">
                        Peta menggunakan Leaflet dan OpenStreetMap. Data alamat
                        dari autocomplete gratis OpenStreetMap/Nominatim untuk
                        kebutuhan awal CRM.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                      <LocationMap position={position} onChange={updatePositionFromMap} />
                    </div>
                  </div>
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
                    Nanti backend akan menyimpan data, koordinat pin point, dan
                    membuat invitation link unik.
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
            ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© 2026 New Raj Interior. All rights reserved.
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

function AddressAutocomplete({
  address,
  isSearching,
  suggestions,
  isReverseGeocoding,
  onAddressChange,
  onSelectAddress,
}: {
  address: string;
  isSearching: boolean;
  suggestions: AddressSuggestion[];
  isReverseGeocoding: boolean;
  onAddressChange: (value: string) => void;
  onSelectAddress: (value: AddressSuggestion) => void;
}) {
  return (
    <div className="relative">
      <label className="text-sm font-semibold" htmlFor="address">
        Alamat Project
      </label>
      <div className="relative mt-3">
        <MapPinIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          id="address"
          className="h-12 pl-12 pr-28"
          placeholder="Ketik alamat project, contoh: Kerobokan Bali"
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
        />
        <span className="absolute right-4 top-3 text-xs font-medium text-muted-foreground">
          {isReverseGeocoding ? "Update..." : isSearching ? "Mencari..." : "OSM"}
        </span>
      </div>

      {suggestions.length > 0 ? (
        <div className="absolute z-[1200] mt-2 max-h-72 w-full overflow-auto rounded-lg border bg-white p-2 shadow-soft">
          {suggestions.map((item) => (
            <button
              className="w-full rounded-md px-3 py-3 text-left text-sm leading-6 hover:bg-[#fff8e8]"
              key={item.place_id}
              onClick={() => onSelectAddress(item)}
              type="button"
            >
              <span className="block font-semibold text-newraj-ink">
                {formatAddressTitle(item)}
              </span>
              <span className="mt-1 block text-muted-foreground">
                {item.display_name}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatAddressTitle(item: AddressSuggestion) {
  const address = item.address;
  return (
    address?.road ||
    address?.suburb ||
    address?.village ||
    address?.town ||
    address?.city ||
    item.display_name.split(",")[0]
  );
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="mt-3 flex h-12 items-center rounded-md border border-input bg-white px-4 text-sm shadow-sm">
        {value}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={label}>
        {label}
      </label>
      <div className="relative mt-3">
        <Icon className="pointer-events-none absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <select
          id={label}
          className="h-12 w-full appearance-none rounded-md border border-input bg-white px-12 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function DatePicker({
  value,
  calendarMonth,
  onMonthChange,
  onChange,
}: {
  value: Date;
  calendarMonth: Date;
  onMonthChange: (date: Date) => void;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const days = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  const selectedKey = toDateKey(value);
  const displayValue = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);

  function moveMonth(amount: number) {
    onMonthChange(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + amount, 1),
    );
  }

  return (
    <div className="relative">
      <label className="text-sm font-semibold" htmlFor="survey-date">
        Jadwal Survey
      </label>
      <button
        className="mt-3 flex h-12 w-full items-center justify-between rounded-md border border-input bg-white px-4 text-left text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        id="survey-date"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-3">
          <CalendarDaysIcon className="h-5 w-5 text-muted-foreground" />
          {displayValue}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute z-[1300] mt-3 w-full min-w-[320px] rounded-lg border bg-white p-4 shadow-soft sm:w-[360px]">
          <div className="mb-5 flex items-center justify-between">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted"
              onClick={() => moveMonth(-1)}
              type="button"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              className="flex items-center gap-2 text-base font-semibold"
              type="button"
            >
              {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-muted"
              onClick={() => moveMonth(1)}
              type="button"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground">
            {dayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
            {days.map((day) => {
              const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
              const isSelected = toDateKey(day) === selectedKey;

              return (
                <button
                  className={[
                    "relative flex h-10 items-center justify-center rounded-full transition-colors",
                    isSelected
                      ? "bg-[#d99a00] font-semibold text-white shadow-[0_8px_18px_rgba(217,154,0,0.28)]"
                      : "hover:bg-[#fff8e8]",
                    isCurrentMonth ? "text-newraj-ink" : "text-muted-foreground/50",
                  ].join(" ")}
                  key={toDateKey(day)}
                  onClick={() => {
                    onChange(day);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {day.getDate()}
                  {isSelected ? (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#d99a00]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - firstWeekDay);

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
  });
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
