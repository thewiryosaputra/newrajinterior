"use client";

import { FormEvent, useState } from "react";
import { EnvelopeIcon, PaperAirplaneIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.newrajinterior.xyz/api";

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
