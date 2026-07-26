import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const steps = [
  {
    title: "Masukkan Email",
    body: "Gunakan email atau nomor telepon yang terdaftar.",
    icon: EnvelopeIcon,
  },
  {
    title: "Cek Instruksi",
    body: "Kami kirimkan panduan reset password dengan aman.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: "Buat Password Baru",
    body: "Gunakan password baru untuk masuk kembali.",
    icon: ShieldCheckIcon,
  },
];

export default function ForgotPasswordPage() {
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
              <h1 className="font-display text-4xl font-bold">
                Reset Access
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/82">
                Recover your account securely and continue managing every
                interior project with confidence.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {steps.map((item) => (
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
              <div className="mb-9 flex items-center justify-between">
                <Image
                  src="/brand/newraj-logo-master.png"
                  alt="New Raj Interior"
                  width={82}
                  height={82}
                  className="h-20 w-20 rounded-full object-contain lg:hidden"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-[#b87900]">
                  <KeyIcon className="h-7 w-7" />
                </div>
              </div>

              <h2 className="font-display text-4xl font-bold">
                Lupa Password?
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Masukkan email atau nomor telepon akun Anda. Kami akan
                mengirimkan instruksi untuk membuat password baru.
              </p>

              <form className="mt-9 space-y-6">
                <div>
                  <label className="text-sm font-semibold" htmlFor="account">
                    Email atau No. Telepon
                  </label>
                  <div className="relative mt-3">
                    <EnvelopeIcon className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="account"
                      className="h-12 pl-12"
                      placeholder="Masukkan email atau nomor telepon"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-newraj-gold/35 bg-[#fff8e8] p-5">
                  <div className="flex gap-4">
                    <LockClosedIcon className="h-6 w-6 shrink-0 text-[#b87900]" />
                    <p className="text-sm leading-7 text-newraj-charcoal">
                      Link reset hanya berlaku sementara dan akan dikirimkan ke
                      kontak yang sudah terdaftar di sistem.
                    </p>
                  </div>
                </div>

                <Button className="h-12 w-full text-base" type="button">
                  Kirim Instruksi Reset
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>

                <Button
                  className="h-12 w-full bg-white text-foreground shadow-sm hover:bg-muted"
                  variant="outline"
                  asChild
                >
                  <Link href="/login">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Kembali ke Login
                  </Link>
                </Button>
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
