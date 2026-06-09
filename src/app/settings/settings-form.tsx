"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/user";
import { Loader2, CheckCircle2, User, WalletCards } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  upiId: string | null;
  venmoUsername: string | null;
  paypalUsername: string | null;
  cashappTag: string | null;
}

export function SettingsForm({ user }: { user: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      upiId: formData.get("upiId") as string,
      venmoUsername: formData.get("venmoUsername") as string,
      paypalUsername: formData.get("paypalUsername") as string,
      cashappTag: formData.get("cashappTag") as string,
    };

    try {
      await updateProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
      {/* Personal Info */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white border-b border-white/[0.08] pb-4">
          <User className="w-5 h-5 text-rose-400" />
          Personal Information
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name || ""}
              required
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-rose-500/50"
              placeholder="Your Name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-neutral-500">Email Address (Cannot be changed)</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user.email || ""}
              disabled
              className="mt-1.5 bg-white/[0.02] border-white/[0.04] text-neutral-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 border-b border-white/[0.08] pb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <WalletCards className="w-5 h-5 text-orange-400" />
            Payment Methods
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Add your payment handles so others can pay you directly with one click.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="upiId" className="text-neutral-300">UPI ID</Label>
            <Input
              id="upiId"
              name="upiId"
              defaultValue={user.upiId || ""}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-emerald-500/50"
              placeholder="e.g. username@upi"
            />
          </div>
          <div>
            <Label htmlFor="venmoUsername" className="text-neutral-300">Venmo Username</Label>
            <Input
              id="venmoUsername"
              name="venmoUsername"
              defaultValue={user.venmoUsername || ""}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-blue-500/50"
              placeholder="e.g. @johndoe"
            />
          </div>
          <div>
            <Label htmlFor="paypalUsername" className="text-neutral-300">PayPal Username</Label>
            <Input
              id="paypalUsername"
              name="paypalUsername"
              defaultValue={user.paypalUsername || ""}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-sky-500/50"
              placeholder="e.g. johndoe"
            />
          </div>
          <div>
            <Label htmlFor="cashappTag" className="text-neutral-300">Cash App Tag</Label>
            <Input
              id="cashappTag"
              name="cashappTag"
              defaultValue={user.cashappTag || ""}
              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white focus-visible:ring-lime-500/50"
              placeholder="e.g. $johndoe"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {success && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4" />
            Saved successfully!
          </span>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#eae151] to-[#ffd60a] hover:from-[#dcd341] hover:to-[#ebc309] text-black font-bold min-w-[140px] rounded-xl shadow-lg shadow-[#ffd60a]/25"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
