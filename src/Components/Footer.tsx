import Link from "next/link";
import { Flag, Vote, Moon, Heart } from "lucide-react";

const Footer = () => {
  return (
    <div className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="w-[95%] sm:w-[90%] lg:max-w-[80%] mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10 sm:mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="sm:col-span-2 space-y-3 sm:space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <span className="text-emerald-400 font-black text-sm">P</span>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Postera<span className="text-emerald-400">.ai</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              বাংলাদেশের প্রথম AI-চালিত প্রিন্ট-রেডি রাজনৈতিক পোস্টার মেকার। তৃণমূল কর্মী, নেতৃবৃন্দ ও 
              প্রচারকদের জন্য তৈরি—যাতে কয়েক সেকেন্ডের মধ্যে তৈরি করা যায় প্রফেশনাল পোস্টার।
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <p className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini AI Engine
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                300 DPI Export
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3 sm:mb-4">
              নেভিগেশন
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  হোম পেজ
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-emerald-400 transition-colors">
                  টেমপ্লেট লাইব্রেরি
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-emerald-400 transition-colors">
                  পোস্টার মেকার
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  আমার পোস্টার হিস্ট্রি
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Occasions / Categories */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3 sm:mb-4">
              জনপ্রিয় উপলক্ষ
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/templates?cat=victoryDay" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>মহান বিজয় দিবস</span>
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=campaign" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>জাতীয় সংসদ ও স্থানীয় নির্বাচন</span>
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=eid" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ঈদ মোবারক ও উৎসব</span>
                </Link>
              </li>
              <li>
                <Link href="/templates?cat=condolence" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>শোক প্রস্তাব ও শ্রদ্ধাঞ্জলি</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Postera.ai — সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/" className="hover:text-slate-400 transition-colors">
              গোপনীয়তা নীতি
            </Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">
              ব্যবহারের শর্তাবলী
            </Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">
              সাহায্য ও সাপোর্ট
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Footer;
