"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/Data";
import {
  Users,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  TrendingUp,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalPosters: number;
  completedPosters: number;
  failedPosters: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosters: 0,
    completedPosters: 0,
    failedPosters: 0,
  });

  useEffect(() => {
    getAdminStats().then((data) => {
      if (data && typeof data.totalUsers === "number") {
        setStats(data);
      }
    });
  }, []);

  const successRate = stats.totalPosters > 0
    ? ((stats.completedPosters / stats.totalPosters) * 100).toFixed(1)
    : "100.0";

  const cards = [
    {
      title: "মোট ব্যবহারকারী",
      key: "totalUsers",
      value: stats.totalUsers,
      subText: "রেজিস্টার্ড তৃণমূল ও অ্যাক্টিভিস্ট",
      icon: Users,
      tint: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        iconColor: "text-blue-400",
        badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      },
    },
    {
      title: "মোট পোস্টার",
      key: "totalPosters",
      value: stats.totalPosters,
      subText: "জেনারেট করা মোট পোস্টারের সংখ্যা",
      icon: ImageIcon,
      tint: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        iconColor: "text-purple-400",
        badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
      },
    },
    {
      title: "সম্পন্ন",
      key: "completedPosters",
      value: stats.completedPosters,
      subText: `সফলতার হার ${successRate}%`,
      icon: CheckCircle,
      tint: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        iconColor: "text-emerald-400",
        badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      },
    },
    {
      title: "ব্যর্থ",
      key: "failedPosters",
      value: stats.failedPosters,
      subText: "প্রসেসিং অথবা সার্ভার ত্রুটি",
      icon: XCircle,
      tint: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        iconColor: "text-red-400",
        badgeBg: "bg-red-500/10 text-red-300 border-red-500/20",
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>অ্যাডমিন ড্যাশবোর্ড</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              লাইভ মেটিক্স
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান ও কার্যকারিতা পর্যবেক্ষণ করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>সিস্টেম স্ট্যাটাস: স্বাভাবিক</span>
          </div>
        </div>
      </div>

      {/* 2x2 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/80 group"
            >
              {/* Subtle Ambient Corner Glow */}
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${card.tint.bg}`}
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {card.value.toLocaleString("bn-BD")}
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${card.tint.bg} ${card.tint.border} ${card.tint.iconColor}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{card.subText}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.tint.badgeBg}`}
                >
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Link
          href="/admin/templates"
          className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                টেমপ্লেট ব্যবস্থাপনা
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                নতুন রাজনৈতিক টেমপ্লেট যোগ করুন, সক্রিয় অথবা নিষ্ক্রিয় করুন
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/posters"
          className="bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                পোস্টার মডারেশন কিউ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ইউজারদের জেনারেট করা পোস্টার যাচাই, অনুমোদন অথবা ফ্লাগ করুন
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
