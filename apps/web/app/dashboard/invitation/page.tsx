"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { CreateInvitationPanel } from "@/components/admin-approval-panel";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";

export default function DashboardInvitationPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("newraj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = window.localStorage.getItem("newraj_user");
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    setCurrentUser(parsedUser);
    if (parsedUser?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem("newraj_access_token");
    window.localStorage.removeItem("newraj_user_role");
    window.localStorage.removeItem("newraj_user");
    router.replace("/login");
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] text-newraj-ink">
        <div className="rounded-lg border bg-white px-6 py-4 text-sm font-medium shadow-sm">Memeriksa sesi login...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-newraj-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar activeItem="Invitation" user={currentUser} onLogout={handleLogout} />

        <section className="min-w-0 px-4 py-6 sm:px-6 xl:px-8">
          <header className="flex flex-col gap-5 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Invitation</h1>
              <p className="mt-2 text-sm text-newraj-charcoal">Buat link invitation customer dan approve request yang sudah terverifikasi.</p>
            </div>
            <Button className="h-10 gap-2 bg-white text-foreground shadow-sm hover:bg-muted" type="button" variant="outline" onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </Button>
          </header>

          <div className="mt-5 space-y-5">
            <CreateInvitationPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
function safeParseUser(value: string): { role?: string } | null {
  try {
    return JSON.parse(value) as { role?: string };
  } catch {
    return null;
  }
}