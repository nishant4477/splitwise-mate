"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function InviteButton({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const inviteLink = `${window.location.origin}/groups/${groupId}/join`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] whitespace-nowrap"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Link2 className="w-4 h-4 text-neutral-400" />
      )}
      {copied ? "Copied!" : "Invite"}
    </button>
  );
}
