"use client";

import { FormEvent, useEffect, useState } from "react";
import { EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, TrashIcon, UserIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.newrajinterior.xyz/api";

type InvitationLink = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  status: "active" | "used" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
};

export function CreateInvitationPanel() {
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadLinks() {
    const token = localStorage.getItem("newraj_access_token");
    const response = await fetch(`${apiBaseUrl}/invitation-requests/invite`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message ?? "Gagal memuat invitation link.");
    setLinks(data.data ?? []);
  }

  useEffect(() => {
    void loadLinks().catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat invitation link."));
  }, []);

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
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat invitation link.");
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteInvitation(id: string) {
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("newraj_access_token");
      const response = await fetch(`${apiBaseUrl}/invitation-requests/invite/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Gagal menghapus invitation link.");
      setMessage("Invitation link sudah dihapus dan tidak aktif lagi.");
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus invitation link.");
    } finally {
      setDeletingId(null);
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

      <div className="mt-8 flex items-center justify-between gap-4">
        <h3 className="font-display text-lg font-semibold">Invitation Link</h3>
        <Button type="button" variant="outline" onClick={() => void loadLinks()}>Refresh</Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-[#faf9f5] text-xs text-newraj-charcoal">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">WhatsApp</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Expired</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {links.length ? links.map((item) => (
              <tr key={item.id} className="hover:bg-[#fffaf0]">
                <td className="px-4 py-3 font-semibold">{item.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.phone}</td>
                <td className="px-4 py-3"><InvitationLinkBadge status={item.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(item.expiresAt)}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    disabled={item.status !== "active" || deletingId === item.id}
                    onClick={() => void deleteInvitation(item.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                    {deletingId === item.id ? "Menghapus..." : "Hapus"}
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="px-4 py-5 text-center text-muted-foreground" colSpan={6}>Belum ada invitation link.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InvitationLinkBadge({ status }: { status: InvitationLink["status"] }) {
  if (status === "active") return <Badge variant="success">Active</Badge>;
  if (status === "used") return <Badge variant="default">Used</Badge>;
  if (status === "revoked") return <Badge variant="muted">Deleted</Badge>;
  return <Badge variant="warning">Expired</Badge>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}