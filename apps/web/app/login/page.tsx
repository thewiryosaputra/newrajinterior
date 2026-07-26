import Image from "next/image";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  HomeIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const benefits = [
  {
    title: "Kelola Project",
    body: "Kelola seluruh project dalam satu tempat",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Pantau Progress",
    body: "Monitor progress secara real-time dan akurat",
    icon: ChartBarIcon,
  },
  {
    title: "Aman & Terpercaya",
    body: "Data terlindungi dengan sistem keamanan terbaik",
    icon: ShieldCheckIcon,
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <section className="relative hidden overflow-hidden bg-[#080807] text-white lg:block">
          <Image
            src="/brand/login-interior-bg.png"
            alt="Luxury New Raj Interior"
            fill
            className="object-cover"
            sizes="45vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.92),rgba(5,5,4,0.52)),linear-gradient(180deg,rgba(5,5,4,0.18),rgba(5,5,4,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(212,175,55,0.26),transparent_22rem)]" />
          <div className="relative z-10 flex min-h-screen flex-col justify-between px-16 py-16">
            <div className="mx-auto text-center">
              <Image
                src="/brand/newraj-logo-master.png"
                alt="New Raj Interior"
                width={230}
                height={230}
                className="mx-auto h-56 w-56 rounded-full object-contain"
                priority
              />
            </div>

            <div className="max-w-md">
              <h1 className="font-display text-4xl font-bold">Welcome Back!</h1>
              <p className="mt-5 text-lg leading-8 text-white/82">
                Sign in to continue managing your projects and monitor progress
                seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {benefits.map((item) => (
                <div key={item.title}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-newraj-gold/55 text-newraj-gold">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
          <div className="flex justify-end">
            <button className="flex h-12 items-center gap-3 rounded-lg border bg-white px-5 text-sm font-medium shadow-sm">
              <GlobeAltIcon className="h-5 w-5" />
              Bahasa Indonesia
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xl rounded-lg border bg-white/92 p-8 shadow-soft sm:p-12">
              <div className="mb-9 lg:hidden">
                <Image
                  src="/brand/newraj-logo-master.png"
                  alt="New Raj Interior"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-contain"
                />
              </div>
              <h2 className="font-display text-4xl font-bold">Login</h2>
              <p className="mt-3 text-base text-muted-foreground">
                Masuk untuk mengakses akun Anda
              </p>

              <form className="mt-9 space-y-6">
                <div>
                  <label className="text-sm font-semibold" htmlFor="email">
                    Email atau No. Telepon
                  </label>
                  <div className="relative mt-3">
                    <EnvelopeIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      className="h-12 pl-12"
                      placeholder="Masukkan email atau nomor telepon"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="password">
                    Password
                  </label>
                  <div className="relative mt-3">
                    <LockClosedIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="h-12 pl-12 pr-12"
                      placeholder="Masukkan password"
                    />
                    <EyeSlashIcon className="absolute right-4 top-3 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-newraj-gold text-white">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    Ingat saya
                  </label>
                  <a
                    className="font-medium text-[#b87900] underline underline-offset-4"
                    href="/forgot-password"
                  >
                    Lupa Password?
                  </a>
                </div>

                <Button className="h-12 w-full text-base" type="button">
                  Login
                </Button>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  atau masuk dengan
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  <Button
                    className="h-12 w-full bg-white text-foreground shadow-sm hover:bg-muted"
                    variant="outline"
                    type="button"
                  >
                    <span className="text-lg font-bold text-[#4285f4]">G</span>
                    Masuk dengan Google
                  </Button>
                  <Button
                    className="h-12 w-full bg-white text-foreground shadow-sm hover:bg-muted"
                    variant="outline"
                    type="button"
                  >
                    <span className="grid h-5 w-5 grid-cols-2 gap-0.5">
                      <i className="bg-[#f35325]" />
                      <i className="bg-[#81bc06]" />
                      <i className="bg-[#05a6f0]" />
                      <i className="bg-[#ffba08]" />
                    </span>
                    Masuk dengan Microsoft
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <a
                    className="font-medium text-[#b87900] underline underline-offset-4"
                    href="/invitation/request"
                  >
                    Daftar sekarang
                  </a>
                </p>
              </form>
            </div>
          </div>

          <p className="pb-4 text-center text-sm text-muted-foreground">
            © 2026 New Raj Interior. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}
