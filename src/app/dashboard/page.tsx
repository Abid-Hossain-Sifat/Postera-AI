"use client";
import { useEffect, useState } from "react";
import { getUserPosters } from "@/lib/Data";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

const DashboardPage = () => {
  const [posters, setPosters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserPosters().then((data) => {
      setPosters(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">আমার পোস্টার হিস্ট্রি</h1>
            <p className="text-slate-400 mt-2">আপনার তৈরি করা সব হাই-রেজুলেশন পোস্টার এখানে পাওয়া যাবে</p>
          </div>
          <Link href="/templates" className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
            + নতুন পোস্টার বানান
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />)}
          </div>
        ) : posters.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-20 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">এখনও কোনো পোস্টার তৈরি করা হয়নি!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posters.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 group hover:border-emerald-500/30 transition-all duration-300">
                <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                     <a href={p.imageUrl} download className="px-5 py-2.5 bg-white text-slate-950 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">ডাউনলোড</a>
                  </div>
                </div>
                <h3 className="text-white font-bold mb-1 line-clamp-1">{p.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-slate-500 text-[10px] font-semibold uppercase">{p.date}</p>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 font-bold">PRINT READY</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;