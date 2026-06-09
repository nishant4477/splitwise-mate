import { getUserProfile } from "@/app/actions/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <UserCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
            <p className="text-neutral-400 mt-1">
              Manage your personal information and payment methods.
            </p>
          </div>
        </div>

        <SettingsForm user={user} />
      </div>
    </div>
  );
}
