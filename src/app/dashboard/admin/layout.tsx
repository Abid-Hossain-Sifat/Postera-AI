"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">অ্যাডমিন প্যানেলে রিডাইরেক্ট করা হচ্ছে...</p>
      </div>
      <div className="hidden">{children}</div>
    </div>
  );
}
