"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  HomeIcon,
  QueueListIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type NavIcon = ComponentType<{ className?: string }>;
type NavItem = {
  label: string;
  href?: string;
  icon: NavIcon;
  adminOnly?: boolean;
};

type DashboardUser = {
  name?: string;
  email?: string;
  role?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon, adminOnly: true },
  { label: "Invitation", href: "/dashboard/invitation", icon: EnvelopeIcon, adminOnly: true },
  { label: "Prospect Client", href: "/dashboard/prospect-client", icon: UserPlusIcon, adminOnly: true },
  { label: "Project", icon: BriefcaseIcon },
  { label: "BOQ", icon: ClipboardDocumentListIcon },
  { label: "Kontrak", icon: DocumentTextIcon },
  { label: "Invoice", icon: CreditCardIcon },
  { label: "Tugas", icon: QueueListIcon, adminOnly: true },
  { label: "Progress", icon: ClockIcon, adminOnly: true },
  { label: "Dokumen", icon: FolderIcon, adminOnly: true },
  { label: "Notifikasi", icon: BellIcon },
  { label: "Laporan", icon: ChartBarIcon, adminOnly: true },
  { label: "Client", icon: UsersIcon, adminOnly: true },
  { label: "Tim", icon: UserGroupIcon, adminOnly: true },
  { label: "Pengaturan", icon: Cog6ToothIcon, adminOnly: true },
];

export function DashboardSidebar({ activeItem, user, onLogout }: { activeItem: string; user: DashboardUser | null; onLogout: () => void }) {
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const visibleItems = navItems.filter((item) => isAdmin || !item.adminOnly);
  const profileName = user?.name || (isAdmin ? "Admin" : "Customer");
  const profileRole = isAdmin ? "Administrator" : "Customer";

  return (
    <aside className="sticky top-0 hidden h-screen bg-[#070908] px-4 py-6 text-white lg:flex lg:flex-col">
      <Image
        src="/brand/newraj-logo-master.png"
        alt="New Raj Interior"
        width={156}
        height={156}
        className="mx-auto h-28 w-28 rounded-full object-contain"
        priority
      />

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === activeItem;
          return (
            <button
              className={[
                "flex h-11 w-full items-center gap-4 rounded-md px-4 text-left text-sm font-medium transition-colors",
                active ? "bg-newraj-gold text-white shadow-gold" : "text-white/88 hover:bg-white/8 hover:text-newraj-gold",
              ].join(" ")}
              key={item.label}
              onClick={() => {
                if (item.href) router.push(item.href);
              }}
              type="button"
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
              {item.label === "Notifikasi" ? <span className="ml-auto rounded-md bg-newraj-gold px-2 py-0.5 text-xs text-white">8</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 shrink-0 rounded-lg border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d7d2c5,#777)] text-sm font-bold text-[#111]">
            {profileName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{profileName}</p>
            <p className="truncate text-xs text-white/68">{profileRole}</p>
          </div>
          <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-newraj-gold" onClick={onLogout} type="button" aria-label="Logout">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
