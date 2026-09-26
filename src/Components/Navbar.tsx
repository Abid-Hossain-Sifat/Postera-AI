"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderOpen, LogOut } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("auth-change", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("auth-change", checkUser);
    };
  }, [pathname]);
  useEffect(() => {
    setIsProfileOpen(false);
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "token_raw=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 text-slate-100">
      <div className="w-[95%] md:w-[92%] lg:max-w-[80%] mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-rose-500 flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Postera<span className="text-emerald-400 font-extrabold">.ai</span>
              </p>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium -mt-1 hidden sm:block">
                AI Political Poster Studio
              </p>
            </div>
          </Link>

          {/* Desktop Links (Visible only on Large Screens 1024px+) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 text-sm font-medium">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive("/")
                  ? "text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
              }`}
            >
              হোম
            </Link>
            <Link
              href="/templates"
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                isActive("/templates")
                  ? "text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
              }`}
            >
              <span>টেমপ্লেট গ্যালারি</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full border transition-colors ${
                  isActive("/templates")
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                নতুন
              </span>
            </Link>
            {user && (
              <Link
                href="/create"
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive("/create")
                    ? "text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                পোস্টার মেকার
              </Link>
            )}
          </div>

          {/* Desktop Action Buttons (Visible only on Large Screens 1024px+) */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                {/* Profile Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-sm transition-all focus:outline-none cursor-pointer group ${
                    isActive("/dashboard") || isProfileOpen
                      ? "bg-slate-900 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-inner">
                    {getInitial(user.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[130px] truncate group-hover:text-white transition-colors">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180 text-emerald-400" : "group-hover:text-slate-300"
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                          {getInitial(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          {user.email && (
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Items */}
                    <div className="p-1.5 space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive("/dashboard")
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold"
                            : "text-slate-200 hover:bg-slate-800/80 hover:text-emerald-400"
                        }`}
                      >
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                        <span>আমার পোস্টার</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1.5 mt-1 border-t border-slate-800/80 p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* When NOT logged in: ONLY Login Button is shown */
              <Link
                href="/login"
                className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm whitespace-nowrap"
              >
                লগইন
              </Link>
            )}
          </div>

          {/* Medium & Small Devices Header (Below 1024px) */}
          <div className="flex lg:hidden items-center gap-2.5">
            {user ? (
              <>
                {/* Profile Avatar Button on Mobile */}
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                    {getInitial(user.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[85px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </>
            ) : (
              /* When NOT logged in: ONLY Login button shown on mobile bar */
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-xl transition-all"
              >
                লগইন
              </Link>
            )}

            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu (Below 1024px) */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-xl px-5 py-4 space-y-2.5 shadow-2xl">
          {user && (
            <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                {getInitial(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive("/")
                ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25"
                : "text-slate-200 hover:bg-slate-900 hover:text-emerald-400"
            }`}
          >
            হোম
          </Link>
          <Link
            href="/templates"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive("/templates")
                ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25"
                : "text-slate-200 hover:bg-slate-900 hover:text-emerald-400"
            }`}
          >
            <span>টেমপ্লেট গ্যালারি</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                isActive("/templates")
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              নতুন
            </span>
          </Link>

          {user && (
            <>
              <Link
                href="/create"
                onClick={() => setIsOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/create")
                    ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25"
                    : "text-slate-200 hover:bg-slate-900 hover:text-emerald-400"
                }`}
              >
                পোস্টার মেকার
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/dashboard")
                    ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25"
                    : "text-slate-200 hover:bg-slate-900 hover:text-emerald-400"
                }`}
              >
                আমার পোস্টার
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-800/80">
            {user ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                লগআউট করুন
              </button>
            ) : (
              <div className="flex items-center justify-between w-full gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  লগইন
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl"
                >
                  রেজিস্ট্রেশন
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
