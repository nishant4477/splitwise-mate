"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Receipt,
  Calculator,
  Check,
  Loader2,
  IndianRupee,
  DollarSign,
  SplitSquareHorizontal,
  PenLine,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { addExpense } from "@/app/actions/expense";
import { scanReceipt } from "@/app/actions/ai";

interface Member {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface AddExpenseFormProps {
  groupId: string;
  groupName: string;
  currency: string;
  members: Member[];
  currentUserId: string;
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

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-violet-600",
];

function getCurrencySymbol(currency: string) {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || currency;
}

type AIScanState = "idle" | "scanning" | "done" | "error";

export default function AddExpenseForm({
  groupId,
  groupName,
  currency,
  members,
  currentUserId,
}: AddExpenseFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Scan state
  const [aiState, setAiState] = useState<AIScanState>("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paidById, setPaidById] = useState(currentUserId);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    {}
  );
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.user.id))
  );

  useEffect(() => {
    const amounts: Record<string, string> = {};
    members.forEach((m) => {
      amounts[m.user.id] = "";
    });
    setCustomAmounts(amounts);
  }, [members]);

  const parsedAmount = parseFloat(amount) || 0;
  const currencySymbol = getCurrencySymbol(currency);

  const equalSplitAmount =
    selectedMembers.size > 0 ? parsedAmount / selectedMembers.size : 0;

  const customTotal = Object.entries(customAmounts).reduce(
    (sum, [userId, val]) => {
      if (selectedMembers.has(userId)) {
        return sum + (parseFloat(val) || 0);
      }
      return sum;
    },
    0
  );

  const remaining = splitType === "custom" ? parsedAmount - customTotal : 0;

  const toggleMember = useCallback((userId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size > 1) next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  // ── AI Receipt Scan ──────────────────────────────────────
  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAiState("scanning");
    setAiMessage("Gemini is reading your receipt...");
    setError("");

    try {
      const base64Reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        base64Reader.onloadend = () => {
          const result = base64Reader.result as string;
          // Strip data URL prefix to get pure base64
          resolve(result.split(",")[1]);
        };
        base64Reader.onerror = reject;
        base64Reader.readAsDataURL(file);
      });

      const result = await scanReceipt(base64Data, file.type);

      // Auto-fill form
      if (result.title) setDescription(result.title);
      if (result.amount) setAmount(String(result.amount));
      if (result.notes) {
        const notesText = [
          result.notes,
          result.category ? `Category: ${result.category}` : "",
        ]
          .filter(Boolean)
          .join(" · ");
        setNotes(notesText);
      } else if (result.category) {
        setNotes(`Category: ${result.category}`);
      }

      setAiState("done");
      setAiMessage(
        `✓ Filled from receipt${result.category ? ` · ${result.category}` : ""}`
      );

      // Reset after a few seconds
      setTimeout(() => {
        setAiState("idle");
        setAiMessage("");
      }, 5000);
    } catch (err) {
      console.error(err);
      setAiState("error");
      setAiMessage("Couldn't read the receipt. Please fill in manually.");
      setTimeout(() => {
        setAiState("idle");
        setAiMessage("");
        setPreviewUrl(null);
      }, 3000);
    } finally {
      // Reset input so same file can be re-picked
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (selectedMembers.size === 0) {
      setError("Select at least one member to split with");
      return;
    }

    let participants: { userId: string; amount: number }[];

    if (splitType === "equal") {
      participants = Array.from(selectedMembers).map((userId) => ({
        userId,
        amount: Math.round(equalSplitAmount * 100) / 100,
      }));
    } else {
      if (Math.abs(remaining) > 0.01) {
        setError(
          `Custom amounts must total ${currencySymbol}${parsedAmount.toFixed(2)}. Currently ${currencySymbol}${customTotal.toFixed(2)}.`
        );
        return;
      }
      participants = Array.from(selectedMembers)
        .filter((userId) => parseFloat(customAmounts[userId]) > 0)
        .map((userId) => ({
          userId,
          amount: parseFloat(customAmounts[userId]),
        }));
    }

    // Fix rounding
    const participantTotal = participants.reduce((s, p) => s + p.amount, 0);
    if (
      participants.length > 0 &&
      Math.abs(participantTotal - parsedAmount) > 0
    ) {
      participants[0].amount += parsedAmount - participantTotal;
      participants[0].amount = Math.round(participants[0].amount * 100) / 100;
    }

    setLoading(true);
    try {
      await addExpense({
        groupId,
        description: description.trim(),
        amount: parsedAmount,
        paidById,
        participants,
      });
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed top-20 right-[20%] w-80 h-80 bg-violet-600/15 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-[15%] w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] animate-float-delayed pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back navigation */}
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {groupName}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Add Expense
            </h1>
            <p className="text-sm text-neutral-400">{groupName}</p>
          </div>
        </div>

        {/* ── AI Receipt Scanner ── */}
        <div
          className="glass-card rounded-2xl p-5 mb-6 animate-fade-up border border-violet-500/10 hover:border-violet-500/20 transition-all duration-300"
          style={{ animationDelay: "30ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-md shadow-violet-500/30">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  AI Receipt Scanner
                </span>
                <span className="ml-2 text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini
                </span>
              </div>
            </div>
            {previewUrl && aiState !== "scanning" && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setAiState("idle");
                  setAiMessage("");
                }}
                className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Scan Button / State */}
          {aiState === "idle" && !previewUrl && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2.5 border border-dashed border-violet-500/30 hover:border-violet-500/60 bg-violet-500/5 hover:bg-violet-500/10 rounded-xl py-4 text-sm font-medium text-violet-300 hover:text-violet-200 transition-all duration-200 group"
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Upload receipt to auto-fill with AI
            </button>
          )}

          {aiState === "scanning" && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium text-violet-300">
                  {aiMessage}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Extracting amount, title, and category...
                </p>
              </div>
            </div>
          )}

          {aiState === "done" && previewUrl && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm font-medium text-emerald-300">
                {aiMessage}
              </p>
            </div>
          )}

          {aiState === "error" && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-sm font-medium text-rose-300">{aiMessage}</p>
            </div>
          )}

          {/* Preview image + rescan button */}
          {previewUrl && aiState === "idle" && (
            <div className="flex items-center gap-3 mt-3">
              <img
                src={previewUrl}
                alt="Receipt"
                className="w-12 h-12 rounded-lg object-cover border border-white/[0.10]"
              />
              <div className="flex-1">
                <p className="text-xs text-neutral-400">
                  Receipt processed successfully
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-violet-400 hover:text-violet-300 mt-0.5 transition-colors"
                >
                  Scan a different receipt →
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div
            className="glass-card rounded-2xl p-6 sm:p-8 mb-6 animate-fade-up space-y-6"
            style={{ animationDelay: "60ms" }}
          >
            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-2">
                <PenLine className="w-3.5 h-3.5 text-violet-400" />
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner at Olive Garden, Groceries, Uber..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-2">
                {currency === "INR" ? (
                  <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                )}
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg font-medium">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3.5 text-2xl font-bold text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            {/* Notes (auto-filled by AI) */}
            {notes && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  AI Notes
                </label>
                <div className="w-full rounded-xl bg-violet-500/5 border border-violet-500/15 px-4 py-3 text-sm text-neutral-300">
                  {notes}
                </div>
              </div>
            )}

            {/* Paid By */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-3">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Paid by
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((member, i) => (
                  <button
                    key={member.user.id}
                    type="button"
                    onClick={() => setPaidById(member.user.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 text-left ${
                      paidById === member.user.id
                        ? "bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]"
                    }`}
                  >
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {getInitials(member.user.name)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-white truncate">
                      {member.user.id === currentUserId
                        ? "You"
                        : member.user.name?.split(" ")[0] || member.user.email}
                    </span>
                    {paidById === member.user.id && (
                      <Check className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Split Section */}
          <div
            className="glass-card rounded-2xl p-6 sm:p-8 mb-6 animate-fade-up space-y-5"
            style={{ animationDelay: "90ms" }}
          >
            {/* Split Type Toggle */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-300 mb-3">
                <SplitSquareHorizontal className="w-3.5 h-3.5 text-amber-400" />
                Split type
              </label>
              <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    splitType === "equal"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  Split Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("custom")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    splitType === "custom"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <PenLine className="w-4 h-4" />
                  Custom Amounts
                </button>
              </div>
            </div>

            {/* Members Split List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-400">
                  Split between
                </span>
                {splitType === "equal" && parsedAmount > 0 && (
                  <span className="text-xs text-neutral-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {currencySymbol}
                    {equalSplitAmount.toFixed(2)} / person
                  </span>
                )}
                {splitType === "custom" && parsedAmount > 0 && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      Math.abs(remaining) < 0.01
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {Math.abs(remaining) < 0.01
                      ? "✓ Balanced"
                      : `${currencySymbol}${remaining.toFixed(2)} remaining`}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {members.map((member, i) => {
                  const isSelected = selectedMembers.has(member.user.id);
                  return (
                    <div
                      key={member.user.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-white/[0.03] border-white/[0.08]"
                          : "bg-white/[0.01] border-white/[0.04] opacity-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleMember(member.user.id)}
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-all ${
                          isSelected ? "" : "ring-2 ring-white/10 bg-white/[0.04]"
                        }`}
                      >
                        {isSelected ? (
                          member.user.image ? (
                            <img
                              src={member.user.image}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/50"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-violet-500/50`}
                            >
                              {getInitials(member.user.name)}
                            </div>
                          )
                        ) : (
                          <span className="text-[10px] text-neutral-600">
                            ✕
                          </span>
                        )}
                      </button>

                      <span className="text-sm font-medium text-white flex-1 truncate">
                        {member.user.id === currentUserId
                          ? "You"
                          : member.user.name || member.user.email}
                      </span>

                      {isSelected && (
                        <>
                          {splitType === "equal" ? (
                            <span className="text-sm font-semibold text-neutral-300 tabular-nums">
                              {parsedAmount > 0
                                ? `${currencySymbol}${equalSplitAmount.toFixed(2)}`
                                : `${currencySymbol}0.00`}
                            </span>
                          ) : (
                            <div className="relative w-28">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-xs">
                                {currencySymbol}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={customAmounts[member.user.id] || ""}
                                onChange={(e) =>
                                  setCustomAmounts((prev) => ({
                                    ...prev,
                                    [member.user.id]: e.target.value,
                                  }))
                                }
                                placeholder="0.00"
                                className="w-full rounded-lg bg-white/[0.06] border border-white/[0.1] pl-7 pr-2 py-2 text-sm font-semibold text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all text-right tabular-nums"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || parsedAmount <= 0 || !description.trim()}
            className="shimmer-btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black font-bold py-4 rounded-xl text-sm hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Add Expense
                {parsedAmount > 0 &&
                  ` · ${currencySymbol}${parsedAmount.toFixed(2)}`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
