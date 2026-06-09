import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGroupForJoin, joinGroup } from "@/app/actions/group";
import Link from "next/link";
import { Users, LogIn, ArrowLeft } from "lucide-react";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const group = await getGroupForJoin(id);

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-neutral-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Group not found</h2>
          <p className="text-neutral-400 mb-6">
            This invite link is invalid or the group was deleted.
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

  // Handle join action
  async function handleJoin() {
    "use server";
    await joinGroup(id);
    redirect(`/groups/${id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-50" />
      
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative z-10 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mx-auto mb-6">
          <Users className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-extrabold mb-2">{group.name}</h1>
        {group.description && (
          <p className="text-neutral-400 text-sm mb-4">{group.description}</p>
        )}
        
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full mb-8">
          <Users className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium">{group._count.members} members</span>
        </div>

        <form action={handleJoin}>
          <button
            type="submit"
            className="shimmer-btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Join Group
          </button>
        </form>
        
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Cancel and go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
