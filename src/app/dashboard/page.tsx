import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyGroups, getDashboardStats } from "@/app/actions/group";
import Link from "next/link";
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Settings,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { SpendingChart } from "@/components/dashboard/spending-chart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [groups, stats] = await Promise.all([
    getMyGroups(),
    getDashboardStats(),
  ]);

  const netBalance = stats.totalOwed - stats.totalOwe;

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed top-10 right-[10%] w-72 h-72 bg-violet-600/10 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-[10%] w-64 h-64 bg-cyan-600/08 rounded-full blur-[100px] animate-float-delayed pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">
              Welcome back,{" "}
              <span className="text-white font-medium">
                {session.user?.name?.split(" ")[0] || session.user?.email}
              </span>
              ! 👋
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all duration-200 hover:border-white/[0.15]"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
            </Link>
            <CreateGroupDialog />
          </div>
        </div>

        {/* ── Balance Summary Cards ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-up"
          style={{ animationDelay: "50ms" }}
        >
          {/* You are owed */}
          <div className="glass-card rounded-2xl p-5 border border-emerald-500/10 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  You are owed
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                ₹{formatCurrency(stats.totalOwed)}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                across all groups
              </p>
            </div>
          </div>

          {/* You owe */}
          <div className="glass-card rounded-2xl p-5 border border-rose-500/10 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  You owe
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-rose-400 tabular-nums">
                ₹{formatCurrency(stats.totalOwe)}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                across all groups
              </p>
            </div>
          </div>

          {/* Net balance */}
          <div
            className={`glass-card rounded-2xl p-5 border relative overflow-hidden group transition-all duration-300 ${
              netBalance >= 0
                ? "border-violet-500/10 hover:border-violet-500/20"
                : "border-amber-500/10 hover:border-amber-500/20"
            }`}
          >
            <div
              className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${
                netBalance >= 0
                  ? "from-violet-500/5 to-transparent"
                  : "from-amber-500/5 to-transparent"
              }`}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Net balance
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    netBalance >= 0 ? "bg-violet-500/10" : "bg-amber-500/10"
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 ${netBalance >= 0 ? "text-violet-400" : "text-amber-400"}`}
                  />
                </div>
              </div>
              <div
                className={`text-2xl font-extrabold tabular-nums ${
                  netBalance >= 0 ? "text-violet-400" : "text-amber-400"
                }`}
              >
                {netBalance >= 0 ? "+" : ""}₹{formatCurrency(netBalance)}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {netBalance >= 0 ? "In your favour" : "You owe overall"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Analytics Row ── */}
        <div
          className="grid lg:grid-cols-3 gap-6 mb-10 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          {/* Spending Chart */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Spending by Category
            </h2>
            <SpendingChart data={stats.categoryData} currency="₹" />
          </div>

          {/* Quick Stats / Activity */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-5">
              <Receipt className="w-4 h-4 text-cyan-400" />
              Your Groups Overview
            </h2>
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-neutral-600">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm text-center">
                  No groups yet. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 5).map((group, i) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200 group/item"
                  >
                    <div
                      className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                      style={{
                        background: [
                          "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                          "linear-gradient(135deg, #06b6d4, #0284c7)",
                          "linear-gradient(135deg, #10b981, #0d9488)",
                          "linear-gradient(135deg, #f59e0b, #d97706)",
                          "linear-gradient(135deg, #f43f5e, #e11d48)",
                        ][i % 5],
                      }}
                    >
                      {group.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover/item:text-violet-300 transition-colors">
                        {group.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group._count.members} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          {group._count.expenses} expenses
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-600 bg-white/[0.04] px-2 py-1 rounded-full shrink-0">
                      {group.currency}
                    </span>
                  </Link>
                ))}
                {groups.length > 5 && (
                  <p className="text-xs text-neutral-600 text-center pt-2">
                    +{groups.length - 5} more groups below
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── All Groups Grid ── */}
        <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Your Groups</h2>
            <span className="text-xs text-neutral-600 bg-white/[0.04] px-3 py-1.5 rounded-full">
              {groups.length} group{groups.length !== 1 ? "s" : ""}
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 border border-dashed border-white/[0.08] text-center">
              <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-neutral-500 mb-6 max-w-xs mx-auto text-sm">
                Create a group for your trip, apartment, or any shared expense
                and start splitting!
              </p>
              <div className="flex justify-center">
                <CreateGroupDialog />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group, i) => (
                <Link
                  href={`/groups/${group.id}`}
                  key={group.id}
                  className="glass-card p-6 rounded-2xl border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 group/card hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-md"
                        style={{
                          background: [
                            "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                            "linear-gradient(135deg, #06b6d4, #0284c7)",
                            "linear-gradient(135deg, #10b981, #0d9488)",
                            "linear-gradient(135deg, #f59e0b, #d97706)",
                            "linear-gradient(135deg, #f43f5e, #e11d48)",
                            "linear-gradient(135deg, #6366f1, #4f46e5)",
                          ][i % 6],
                        }}
                      >
                        {group.name.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover/card:text-violet-300 transition-colors">
                        {group.name}
                      </h3>
                    </div>
                    <span className="text-xs font-medium bg-white/[0.05] px-2 py-1 rounded-lg text-neutral-400 shrink-0">
                      {group.currency}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-neutral-500 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{group._count.members} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{group._count.expenses} expenses</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
