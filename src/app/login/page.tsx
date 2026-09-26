"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/Data";
import { toast } from "react-toastify";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      if (data.token) {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `token_raw=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        window.dispatchEvent(new Event("auth-change"));
        toast.success(data.message || "লগইন সফল হয়েছে!");
        window.location.href = "/";
      } else {
        const msg = data.message || "লগইন ব্যর্থ হয়েছে";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "লগইন করা সম্ভব হয়নি, আবার চেষ্টা করুন";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] w-full bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden px-4 py-8 sm:py-16">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Responsive Card */}
      <div className="w-[95%] sm:w-[460px] bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Logo & Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 sm:mb-4 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-emerald-400 font-black text-base sm:text-lg">P</span>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Postera<span className="text-emerald-400">.ai</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">স্বাগতম! লগইন করুন</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">আপনার পোস্টার ও অ্যাকাউন্ট অ্যাক্সেস করতে লগইন করুন</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
              ইমেইল বা ফোন নম্বর
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-11 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors p-1"
                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0" />
              <span>মনে রাখুন</span>
            </label>
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-400 border-t border-slate-800/80 pt-5 sm:pt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
