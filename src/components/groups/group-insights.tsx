"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { getGroupInsights } from "@/app/actions/insights";

export function GroupInsights({ groupId }: { groupId: string }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchInsights() {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroupInsights(groupId);
      setInsights(data || "No insights could be generated at this time.");
    } catch (err) {
      setError("Failed to fetch insights.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (insights) {
    return (
      <div className="glass-card rounded-2xl p-5 mb-6 border border-violet-500/20 relative animate-in fade-in slide-in-from-top-4">
        <button
          onClick={() => setInsights(null)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Gemini Insights
          </h3>
        </div>
        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-li:marker:text-violet-500">
          {/* Simple markdown render since gemini returns bullet points */}
          {insights.split("\n").map((line, i) => (
            <p key={i} className="mb-2 text-neutral-300">
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={fetchInsights}
      disabled={loading}
      className="w-full glass-card rounded-2xl p-4 mb-6 border border-white/[0.08] hover:border-[#ffd60a]/30 hover:bg-[#ffd60a]/5 transition-all duration-300 flex items-center justify-center gap-2 group"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 text-[#ffd60a] animate-spin" />
      ) : (
        <Sparkles className="w-5 h-5 text-[#ffd60a] group-hover:scale-110 transition-transform" />
      )}
      <span className="font-semibold text-[#ffd60a]">
        {loading ? "Analyzing expenses..." : "Get AI Insights for this Group"}
      </span>
    </button>
  );
}
