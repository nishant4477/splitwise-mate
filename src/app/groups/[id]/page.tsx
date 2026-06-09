import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGroupDetails } from "@/app/actions/group";
import { calculateSettlements } from "@/lib/settlements";
import { SettlementCard } from "@/components/settlements/settlement-card";
import { GroupInsights } from "@/components/groups/group-insights";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  Calendar,
  Wallet,
  TrendingUp,
  Clock,
  IndianRupee,
  HandCoins,
  Settings,
} from "lucide-react";

function formatCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const symbol = symbols[currency] || currency + " ";
  return `${symbol}${amount.toFixed(2)}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const group = await getGroupDetails(id);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-neutral-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Group not found</h2>
          <p className="text-neutral-400 mb-6">
            This group doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate balances
  const balances: Record<string, number> = {};
  group.members.forEach((m) => {
    balances[m.user.id] = 0;
  });

  group.expenses.forEach((expense) => {
    // Payer gets positive balance
    balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.amount;

    // Participants get negative balance
    expense.participants.forEach((p) => {
      balances[p.userId] = (balances[p.userId] || 0) - p.amount;
    });
  });

  const settlements = calculateSettlements(balances);
  const myUserId = session.user.id;
  const myBalance = balances[myUserId] || 0;
  const totalExpenses = group.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] animate-float-delayed pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8 group/link"
        >
          <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="text-sm text-neutral-400 mt-0.5">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/groups/${group.id}/add-expense`}
              className="shimmer-btn flex items-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-2xl font-bold">
                  {group.members.length}
                </span>
              </div>
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Members
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-2xl font-bold">
                  {group.expenses.length}
                </span>
              </div>
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Expenses
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-2xl font-bold">
                  {formatCurrency(totalExpenses, group.currency)}
                </span>
              </div>
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                Total Spent
              </span>
            </div>
          </div>
        </div>

        {/* AI Insights Button */}
        <GroupInsights groupId={group.id} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left Column: Members & Balances ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Members */}
            <div className="glass-card rounded-2xl p-6 animate-fade-up">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members
              </h2>
              <div className="space-y-3">
                {group.members.map((member, i) => {
                  const balance = balances[member.user.id] || 0;
                  return (
                    <div
                      key={member.user.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                    >
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name || ""}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                        >
                          {getInitials(member.user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {member.user.name || member.user.email}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            balance > 0.01
                              ? "text-emerald-400"
                              : balance < -0.01
                                ? "text-rose-400"
                                : "text-neutral-500"
                          }`}
                        >
                          {balance > 0.01
                            ? `gets back ${formatCurrency(balance, group.currency)}`
                            : balance < -0.01
                              ? `owes ${formatCurrency(Math.abs(balance), group.currency)}`
                              : "settled up"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Balances Summary */}
            <div className="glass-card rounded-2xl p-6 animate-fade-up">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Balances
              </h2>
              <div className="space-y-3">
                {group.members.map((member, i) => {
                  const balance = balances[member.user.id] || 0;
                  const maxBalance = Math.max(
                    ...Object.values(balances).map(Math.abs),
                    1
                  );
                  const barWidth = Math.min(
                    (Math.abs(balance) / maxBalance) * 100,
                    100
                  );
                  return (
                    <div key={member.user.id}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-neutral-300 font-medium truncate max-w-[60%]">
                          {member.user.name || member.user.email}
                        </span>
                        <span
                          className={`font-semibold ${
                            balance > 0.01
                              ? "text-emerald-400"
                              : balance < -0.01
                                ? "text-rose-400"
                                : "text-neutral-500"
                          }`}
                        >
                          {balance > 0.01 ? "+" : ""}
                          {formatCurrency(balance, group.currency)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            balance > 0.01
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : balance < -0.01
                                ? "bg-gradient-to-r from-rose-500 to-rose-400"
                                : "bg-neutral-600"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Column: Settlements + Expense Feed ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Settle Up Card ── */}
            {(() => {
              const settlements = calculateSettlements(balances);
              const currentUserId = session!.user.id;
              return (
                <div className="glass-card rounded-2xl p-6 animate-fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                      <HandCoins className="w-4 h-4 text-amber-400" />
                      Settle Up
                    </h2>
                    {settlements.length === 0 && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                        ✓ All settled!
                      </span>
                    )}
                  </div>

                  {settlements.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <HandCoins className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-sm text-neutral-500">
                        Everyone is settled up. No pending debts!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {settlements.map((s, idx) => {
                        const fromMember = group.members.find(
                          (m) => m.user.id === s.from
                        );
                        const toMember = group.members.find(
                          (m) => m.user.id === s.to
                        );
                        const fromIndex = group.members.findIndex(
                          (m) => m.user.id === s.from
                        );
                        const toIndex = group.members.findIndex(
                          (m) => m.user.id === s.to
                        );
                        if (!fromMember || !toMember) return null;
                        return (
                          <SettlementCard
                            key={idx}
                            groupId={group.id}
                            fromUser={fromMember.user}
                            toUser={toMember.user}
                            amount={s.amount}
                            currency={group.currency}
                            fromColorClass={avatarColors[fromIndex % avatarColors.length]}
                            toColorClass={avatarColors[toIndex % avatarColors.length]}
                            isCurrentUser={s.from === currentUserId}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Expense Feed ── */}
            <div className="glass-card rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expense History
                </h2>
                <span className="text-xs text-neutral-600 bg-white/[0.04] px-2.5 py-1 rounded-full">
                  {group.currency}
                </span>
              </div>

              {group.expenses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-neutral-500 text-sm mb-6 max-w-xs mx-auto">
                    Add your first expense to start tracking who owes whom.
                  </p>
                  <Link
                    href={`/groups/${group.id}/add-expense`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Expense
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {group.expenses.map((expense, idx) => {
                    const paidByMemberIndex = group.members.findIndex(
                      (m) => m.user.id === expense.paidById
                    );
                    const colorIndex =
                      paidByMemberIndex >= 0 ? paidByMemberIndex : idx;

                    return (
                      <div
                        key={expense.id}
                        className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-all duration-200 border border-transparent hover:border-white/[0.06]"
                        style={{
                          animationDelay: `${idx * 50}ms`,
                        }}
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Receipt className="w-5 h-5 text-white" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {expense.description}
                            </span>
                            {expense.category && (
                              <span className="text-[10px] bg-white/[0.05] text-neutral-400 px-1.5 py-0.5 rounded-md">
                                {expense.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-neutral-500">
                              Paid by{" "}
                              <span className="text-neutral-300 font-medium">
                                {expense.paidBy.name}
                              </span>
                            </span>
                            <span className="text-neutral-700">·</span>
                            <span className="text-xs text-neutral-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(expense.date)}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-white">
                            {formatCurrency(expense.amount, group.currency)}
                          </div>
                          <div className="text-[10px] text-neutral-600 uppercase tracking-wider mt-0.5">
                            split {expense.participants.length} way
                            {expense.participants.length !== 1 && "s"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
