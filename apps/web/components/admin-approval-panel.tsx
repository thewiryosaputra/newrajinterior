"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircleIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.newrajinterior.xyz/api";

type InvitationRequest = {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  projectType: string;
  estimatedBudget: string;
  status: string;
  emailVerified: boolean;
  whatsappVerified: boolean;
};

export function CreateInvitationPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const token = localStorage.getItem("newraj_access_token");
      const response = await fetch(`${apiBaseUrl}/invitation-requests/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          email: form.get("email"),
          phone: form.get("phone"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Gagal membuat invitation link.");
      setMessage("Invitation link sudah dikirim ke email dan WhatsApp customer.");
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invitation link.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-xl font-semibold">Create Invitation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Admin input nama, email, dan WhatsApp. Sistem mengirim link request invitation sekali pakai.</p>
      </div>

      <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={createInvitation}>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="customerName" className="h-11 pl-10" placeholder="Nama customer" required />
        </div>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="email" type="email" className="h-11 pl-10" placeholder="Email customer" required />
        </div>
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="phone" className="h-11 pl-10" placeholder="Nomor WhatsApp" required />
        </div>
        <Button className="h-11" type="submit" disabled={isCreating}>
          <PaperAirplaneIcon className="h-5 w-5" />
          {isCreating ? "Mengirim..." : "Kirim Link"}
        </Button>
      </form>

      {message ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{message}</div> : null}
      {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
    </section>
  );
}

export function AdminApprovalPanel() {
  const [items, setItems] = useState<InvitationRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadRequests() {
    const response = await fetch(`${apiBaseUrl}/invitation-requests`, { cache: "no-store" });
    const data = await response.json();
    setItems(data.data ?? []);
  }

  useEffect(() => {
    void loadRequests().catch(() => setError("Gagal memuat request invitation."));
  }, []);

  async function approve(id: string) {
    setLoadingId(id);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("newraj_access_token");
      const response = await fetch(`${apiBaseUrl}/invitation-requests/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Approval gagal.");
      setMessage("Request disetujui. Email setup password sudah dikirim ke customer.");
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval gagal.");
    } finally {
      setLoadingId(null);
    }
  }

  const pending = items.filter((item) => item.status !== "approved").slice(0, 5);

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Approval Invitation Request</h2>
          <p className="mt-1 text-sm text-muted-foreground">Approve setelah email dan WhatsApp customer terverifikasi.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadRequests()}>Refresh</Button>
      </div>

      {message ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{message}</div> : null}
      {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}

      <div className="mt-5 space-y-3">
        {pending.length ? pending.map((item) => {
          const ready = item.emailVerified && item.whatsappVerified;
          return (
            <div key={item.id} className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.customerName}</p>
                  <Badge variant={ready ? "success" : "warning"}>{ready ? "Siap Approve" : "Menunggu Verifikasi"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.projectType} - {item.estimatedBudget}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><EnvelopeIcon className="h-4 w-4" />{item.email} {item.emailVerified ? "verified" : "pending"}</span>
                  <span className="flex items-center gap-1"><PhoneIcon className="h-4 w-4" />{item.phone} {item.whatsappVerified ? "verified" : "pending"}</span>
                </div>
              </div>
              <Button type="button" disabled={!ready || loadingId === item.id} onClick={() => void approve(item.id)}>
                <CheckCircleIcon className="h-5 w-5" />
                {loadingId === item.id ? "Approving..." : "Approve"}
              </Button>
            </div>
          );
        }) : <p className="rounded-lg border bg-[#fbfaf7] p-4 text-sm text-muted-foreground">Belum ada request yang perlu approval.</p>}
      </div>
    </section>
  );
}