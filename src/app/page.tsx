"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Wallet,
  Users,
  Receipt,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Sparkles,
} from "lucide-react";

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Expenses Tracked", value: "₹2Cr+", icon: Receipt },
  { label: "Groups Created", value: "12K+", icon: Globe },
  { label: "Settlements", value: "98K+", icon: Zap },
];

const features = [
  {
    icon: Users,
    title: "Group Expenses",
    description:
      "Create groups for apartments, trips, hostels, or any shared living. Add members via email or shareable invite links.",
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Receipt,
    title: "Smart Splitting",
    description:
      "Split equally, by percentage, custom amounts, or shares. Our engine handles all the math so you don't have to.",
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.15)",
  },
  {
    icon: TrendingUp,
    title: "Debt Simplification",
    description:
      "Our algorithm minimizes the total number of transactions. Instead of 10 payments, you might need just 3.",
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "rgba(52, 211, 153, 0.15)",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Generate payment links for Venmo, PayPal, UPI, and Cash App automatically. One tap to settle any balance.",
    gradient: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: Sparkles,
    title: "AI Receipt OCR",
    description:
      "Snap a photo of any receipt. Our AI extracts the merchant name, total amount, and date in seconds.",
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.15)",
  },
  {
    icon: Shield,
    title: "Spending Insights",
    description:
      "Interactive charts for monthly spending, category breakdowns, and contribution analysis across all your groups.",
    gradient: "from-indigo-500 to-violet-600",
    glowColor: "rgba(99, 102, 241, 0.15)",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Roommate in Mumbai",
    text: "SplitMate literally saved our friendship. No more fights over who paid for what. The UPI integration is 🔥",
    avatar: "PS",
    color: "bg-violet-500",
  },
  {
    name: "Rahul Verma",
    role: "Hostel Life, IIT Delhi",
    text: "We use it for everything — mess bills, WiFi, even chai runs. The debt simplification is genuinely brilliant.",
    avatar: "RV",
    color: "bg-cyan-500",
  },
  {
    name: "Ananya Gupta",
    role: "Goa Trip Group",
    text: "Used it for our entire Goa trip. Adding expenses on the go and settling up at the end was incredibly smooth.",
    avatar: "AG",
    color: "bg-emerald-500",
  },
];

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    const numericPart = target.replace(/[^0-9]/g, "");
    const prefix = target.replace(/[0-9]+.*/, "");
    const suffixPart = target.replace(/.*[0-9]/, "");
    const targetNum = parseInt(numericPart);
    const duration = 2000;
    const steps = 60;
    const increment = targetNum / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNum) {
        current = targetNum;
        clearInterval(timer);
      }
      setDisplay(`${prefix}${Math.floor(current).toLocaleString()}${suffixPart}`);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, hasAnimated]);

  return <span>{display}{suffix}</span>;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />

      {/* Floating orbs */}
      <div className="fixed top-20 left-[10%] w-72 h-72 bg-violet-600/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed top-60 right-[15%] w-96 h-96 bg-cyan-600/15 rounded-full blur-[150px] animate-float-delayed pointer-events-none" />
      <div className="fixed bottom-20 left-[30%] w-80 h-80 bg-emerald-600/10 rounded-full blur-[130px] animate-float pointer-events-none" />

      {/* =================== NAVBAR =================== */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Split<span className="gradient-text">Mate</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-neutral-400 hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#testimonials" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Reviews
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="shimmer-btn text-sm font-bold bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#ffd60a]/25 transition-all active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* =================== HERO =================== */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-neutral-300">
              Trusted by <span className="text-white font-semibold">50,000+</span> roommates
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8">
            <span className="block text-white">Stop Arguing.</span>
            <span className="block mt-2 gradient-text">Start Splitting.</span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-up-delayed opacity-0 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform to split bills, track balances, and settle
            debts with your roommates — with one-tap payments via UPI, Venmo,
            PayPal & Cash App.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up-delayed-2 opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="shimmer-btn group flex items-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_60px_15px_rgba(255,214,10,0.2)] active:scale-95"
            >
              Start Splitting Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-neutral-300 hover:text-white px-8 py-4 rounded-full font-medium border border-white/[0.08] hover:bg-white/[0.04] transition-all"
            >
              See How It Works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats bar */}
          <div className="glass-card rounded-2xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-4 h-4 text-neutral-500 mr-2" />
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} />
                  </span>
                </div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm uppercase tracking-widest text-violet-400 font-semibold mb-4 block">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Everything you need to
              <br />
              <span className="gradient-text">split expenses fairly</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              From adding a ₹50 chai bill to settling a ₹50,000 rent — SplitMate
              handles it all with zero friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${feature.glowColor}, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm uppercase tracking-widest text-cyan-400 font-semibold mb-4 block">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Three steps to <span className="gradient-text">peace of mind</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create a Group",
                desc: "Set up a group for your flat, trip, or hostel room. Invite members with a link or email.",
                gradient: "from-violet-500 to-purple-600",
              },
              {
                step: "02",
                title: "Add Expenses",
                desc: "Log expenses with flexible split options — equal, percentage, custom, or share-based.",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                step: "03",
                title: "Settle Up",
                desc: "See simplified balances and settle instantly via UPI, Venmo, PayPal, or Cash App.",
                gradient: "from-emerald-500 to-teal-600",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative group">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="glass-card rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300">
                  <div
                    className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm uppercase tracking-widest text-emerald-400 font-semibold mb-4 block">
              Loved by Roommates
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Don&apos;t take our word for it
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass-card rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-neutral-300 leading-relaxed mb-8 text-[15px]">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-neutral-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 md:p-20 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-[150px]" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Ready to stop the awkward
                <br />
                <span className="gradient-text">&ldquo;you owe me&rdquo;</span> texts?
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
                Join 50,000+ roommates who split expenses without the drama.
                Free forever for personal use.
              </p>
              <Link
                href="/register"
                className="shimmer-btn inline-flex items-center gap-2 bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black px-10 py-5 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_60px_15px_rgba(255,214,10,0.25)] active:scale-95"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="relative border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">SplitMate</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-sm text-neutral-600">
            © {new Date().getFullYear()} SplitMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
