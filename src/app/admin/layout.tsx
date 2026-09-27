"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface AdminUser {
  name: string;
  email?: string;
  role?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.replace("/login");
        return;
      }

      const parsedUser: AdminUser = JSON.parse(userStr);

      if (parsedUser.role !== "admin") {
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
      setIsAuthorized(true);
    } catch {
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "token_raw=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/login");
  };

  const navItems = [
    {
      name: "ওভারভিউ",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "টেমপ্লেট",
      href: "/admin/templates",
      icon: Layers,
      badge: "ম্যানেজার",
    },
    {
      name: "মডারেশন",
      href: "/admin/posters",
      icon: ShieldAlert,
      badge: "কিউ",
    },
  ];

  const isActiveLink = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">অ্যাডমিন ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex overflow-hidden font-sans text-slate-100">
      {/* Left Sidebar (fixed, w-64) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-20 select-none">
        <div>
          {/* Header & Logo */}
          <div className="p-6 border-b border-slate-800">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-emerald-400">
                  Postera <span className="text-white">Admin</span>
                </span>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  কন্ট্রোল প্যানেল
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              মূল মেনু
            </p>
            {navItems.map((item) => {
              const active = isActiveLink(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area & Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shrink-0">
              {user?.name ? user.name.trim().charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "সুপার অ্যাডমিন"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "admin@postera.ai"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (ml-64, full height, bg-slate-950) */}
      <main className="ml-64 flex-1 h-full overflow-y-auto bg-slate-950 p-6 sm:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
