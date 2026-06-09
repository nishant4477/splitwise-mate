"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordSettlement } from "@/app/actions/expense";
import { generatePaymentLinks } from "@/lib/payments";
import { Loader2, CheckCheck, ArrowRight, ExternalLink } from "lucide-react";

interface PaymentUser {
  id: string;
  name: string | null;
  image: string | null;
  upiId?: string | null;
  venmoUsername?: string | null;
  paypalUsername?: string | null;
  cashappTag?: string | null;
}

interface SettlementCardProps {
  groupId: string;
  fromUser: { id: string; name: string | null; image: string | null };
  toUser: PaymentUser;
  amount: number;
  currency: string;
  fromColorClass: string;
  toColorClass: string;
  isCurrentUser: boolean; // whether the logged-in user is the one who owes
}

function getCurrencySymbol(currency: string) {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || currency;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const paymentMeta: Record<
  string,
  { label: string; shortLabel: string; color: string; bgColor: string }
> = {
  upi: {
    label: "Pay via UPI",
    shortLabel: "UPI",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  venmo: {
    label: "Pay via Venmo",
    shortLabel: "Venmo",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
  },
  paypal: {
    label: "Pay via PayPal",
    shortLabel: "PayPal",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15",
  },
  cashapp: {
    label: "Pay via Cash App",
    shortLabel: "Cash App",
    color: "text-lime-400",
    bgColor: "bg-lime-500/10 border-lime-500/20 hover:bg-lime-500/15",
  },
};

export function SettlementCard({
  groupId,
  fromUser,
  toUser,
  amount,
  currency,
  fromColorClass,
  toColorClass,
  isCurrentUser,
}: SettlementCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const symbol = getCurrencySymbol(currency);

  const paymentLinks = generatePaymentLinks(
    toUser,
    amount,
    currency,
    `${fromUser.name || "Someone"} → ${toUser.name || "Someone"} via SplitMate`
  );

  const hasPaymentLinks = Object.keys(paymentLinks).length > 0;

  async function handleMarkPaid() {
    setLoading(true);
    try {
      await recordSettlement({
        groupId,
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount,
      });
      setDone(true);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-scale-in">
        <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm text-emerald-400 font-medium">
            Settlement recorded!
          </span>
          <p className="text-xs text-neutral-500 mt-0.5">
            {fromUser.name} paid {toUser.name} {symbol}
            {amount.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-200 space-y-3">
      {/* Who owes whom */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* From avatar */}
        <div className="flex items-center gap-2">
          {fromUser.image ? (
            <img
              src={fromUser.image}
              alt=""
              className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-500/30"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${fromColorClass} flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-rose-500/20`}
            >
              {getInitials(fromUser.name)}
            </div>
          )}
          <span className="text-sm font-semibold text-white">
            {isCurrentUser ? (
              <span className="text-rose-400">You</span>
            ) : (
              fromUser.name || "Someone"
            )}
          </span>
        </div>

        {/* Arrow + Amount */}
        <div className="flex items-center gap-1.5 px-2">
          <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-sm font-bold text-white tabular-nums">
            {symbol}
            {amount.toFixed(2)}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
        </div>

        {/* To avatar */}
        <div className="flex items-center gap-2">
          {toUser.image ? (
            <img
              src={toUser.image}
              alt=""
              className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/30"
            />
          ) : (
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${toColorClass} flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-emerald-500/20`}
            >
              {getInitials(toUser.name)}
            </div>
          )}
          <span className="text-sm font-semibold text-emerald-400">
            {toUser.name || "Someone"}
          </span>
        </div>
      </div>

      {/* Payment buttons */}
      <div className="flex flex-wrap gap-2">
        {hasPaymentLinks &&
          Object.entries(paymentLinks).map(([method, link]) => {
            const meta = paymentMeta[method];
            if (!meta) return null;
            return (
              <a
                key={method}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${meta.bgColor} ${meta.color}`}
              >
                {meta.shortLabel}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            );
          })}

        {!hasPaymentLinks && (
          <p className="text-xs text-neutral-600 italic">
            No payment methods set up for {toUser.name?.split(" ")[0]}
          </p>
        )}

        {/* Mark as Paid */}
        <button
          onClick={handleMarkPaid}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-xs font-semibold text-neutral-300 hover:text-white transition-all duration-200 disabled:opacity-50 ml-auto"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCheck className="w-3 h-3" />
          )}
          Mark as Paid
        </button>
      </div>
    </div>
  );
}
