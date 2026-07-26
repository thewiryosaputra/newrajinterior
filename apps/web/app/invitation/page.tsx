import Image from "next/image";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  GlobeAltIcon,
  LightBulbIcon,
  MapIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const invitationDetails = [
  {
    label: "Invited by",
    value: "Dian",
    icon: UserIcon,
  },
  {
    label: "Phone Number",
    value: "081238979785",
    icon: PhoneIcon,
  },
  {
    label: "Project Address",
    value: "Jln. Dukuh Indah 15, Kerobokan.",
    icon: MapPinIcon,
    wide: true,
  },
  {
    label: "Map Location",
    value: "https://maps.app.goo.gl/HrCHQG6xEEyKsd5y6?g_st=ic",
    icon: MapIcon,
    wide: true,
    link: true,
  },
  {
    label: "Project Type",
    value: "Kitchen Set, Bathroom Cabinet",
    icon: BriefcaseIcon,
    wide: true,
  },
];

const benefits = [
  {
    title: "Personalized Project Management",
    body: "Manage your project easily in one place.",
    icon: BriefcaseIcon,
  },
  {
    title: "Professional Team",
    body: "Work with our experienced interior experts.",
    icon: UserGroupIcon,
  },
  {
    title: "Quality & Trust",
    body: "We deliver the best quality with detail.",
    icon: ShieldCheckIcon,
  },
];

export default function InvitationPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[34%_66%]">
        <aside className="relative hidden overflow-hidden bg-[#070807] text-white lg:block">
          <Image
            src="/brand/login-interior-bg.png"
            alt="New Raj Interior invitation"
            fill
            className="object-cover"
            sizes="34vw"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.68),rgba(5,5,4,0.95)),linear-gradient(90deg,rgba(5,5,4,0.72),rgba(5,5,4,0.38))]" />
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
              <p className="font-display text-3xl tracking-[0.28em]">YOU'RE</p>
              <h1 className="mt-4 font-display text-6xl font-bold tracking-[0.14em] text-newraj-gold">
                INVITED
              </h1>
              <div className="mx-auto mt-5 h-px w-40 bg-newraj-gold" />
              <p className="mx-auto mt-8 max-w-xs text-lg leading-8 text-white/86">
                You have been invited to create an account and start your
                interior project with New Raj Interior.
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
              English
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-5xl rounded-lg border bg-white/90 p-8 shadow-soft backdrop-blur sm:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="font-display text-5xl font-bold">
                  You're Invited!
                </h2>
                <div className="mx-auto mt-5 flex w-36 items-center gap-3 text-newraj-gold">
                  <div className="h-px flex-1 bg-newraj-gold" />
                  <span className="h-2 w-2 rotate-45 bg-newraj-gold" />
                  <div className="h-px flex-1 bg-newraj-gold" />
                </div>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Dian has invited you to join a project on New Raj Interior.
                  Please create an account to view and manage the project
                  details.
                </p>
              </div>

              <div className="mt-10">
                <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-[#b87900]">
                  <UserPlusIcon className="h-5 w-5" />
                  Invitation Details
                </div>
                <div className="grid overflow-hidden rounded-lg border bg-white md:grid-cols-2">
                  {invitationDetails.map((item) => (
                    <div
                      className={[
                        "flex gap-4 border-b p-5 last:border-b-0 md:last:border-b md:[&:nth-last-child(-n+1)]:border-b-0",
                        item.wide ? "md:col-span-2" : "",
                      ].join(" ")}
                      key={item.label}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[#b87900]">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        {item.link ? (
                          <a
                            className="mt-1 block truncate font-semibold text-blue-700"
                            href={item.value}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 font-semibold">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-newraj-gold/35 bg-[#fff8e8] p-5">
                <div className="flex gap-4">
                  <LightBulbIcon className="h-7 w-7 shrink-0 text-[#b87900]" />
                  <div>
                    <p className="font-semibold">What happens next?</p>
                    <p className="mt-2 leading-7 text-sm text-newraj-charcoal">
                      After you create your account, you can view project
                      information, communicate with our team, track progress,
                      and approve designs.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="mt-6 h-14 w-full text-base uppercase" asChild>
                <a href="/login">
                  <UserPlusIcon className="h-6 w-6" />
                  Create Account
                </a>
              </Button>

              <div className="my-5 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>

              <a href="/login" className="flex h-14 w-full items-center justify-between rounded-lg border bg-white px-5 text-sm font-medium shadow-sm">
                <span className="flex items-center gap-3">
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                  I already have an account
                </span>
                <span className="flex items-center gap-2 text-[#b87900]">
                  Log in <ArrowRightIcon className="h-4 w-4" />
                </span>
              </a>
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
