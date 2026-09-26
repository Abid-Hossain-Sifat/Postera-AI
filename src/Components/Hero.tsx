import Link from "next/link";
import { Flag, Printer, PenTool, Sparkles, Zap } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 py-12 sm:py-16 md:py-24">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] md:w-[700px] h-[350px] sm:h-[550px] md:h-[700px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-5 sm:right-10 md:right-20 w-[250px] sm:w-[350px] md:w-[400px] h-[250px] sm:h-[350px] md:h-[400px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-[95%] sm:w-[90%] lg:max-w-[80%] mx-auto px-2 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-inner">
          <p className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <p>বাংলাদেশের প্রথম AI পলিটিক্যাল পোস্টার প্ল্যাটফর্ম</p>
          </div>
          <p className="text-slate-500 hidden sm:inline">•</p>
          <p className="text-slate-300 font-semibold hidden sm:inline">Gemini + Puppeteer</p>
        </div>

        {/* Main High-Impact Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4 sm:mb-6">
          ১ মিনিটে তৈরি করুন <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            প্রিন্ট-রেডি বাংলা
          </span>{" "}
          <span className="bg-gradient-to-r from-rose-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
            রাজনৈতিক পোস্টার
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="max-w-3xl mx-auto text-sm sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed mb-8 sm:mb-12 px-2">
          জাতীয় সংসদ নির্বাচন, বিজয় দিবস, ঈদ মোবারক কিংবা শ্রদ্ধাঞ্জলি—কোনো গ্রাফিক্স ডিজাইন জ্ঞান ছাড়াই 
          নেতাদের ছবি, দলীয় প্রতীক ও <span className="text-emerald-400 font-semibold">১০০% নিখুঁত বাংলা যুক্তবর্ণ</span> সহ 
          তৈরি করুন হাই-রেজুলেশন পোস্টার।
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-12 sm:mb-20">
          <Link
            href="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>বিনামূল্যে পোস্টার তৈরি করুন</span>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all duration-200"
          >
            <span>টেমপ্লেট গ্যালারি দেখুন</span>
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </Link>
        </div>

        {/* Text-Based Feature Highlights Grid (1 col on mobile, 2 on tablet, 4 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
          
          {/* Card 1 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 sm:mb-4 text-emerald-400">
              <Printer className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mb-1">300 DPI প্রিন্ট কোয়ালিটি</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              প্রেস থেকে সরাসরি ছাপানোর উপযোগী ১২০০×১৬০০+ পিক্সেল আল্ট্রা-এইচডি ফরম্যাট।
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3 sm:mb-4 text-teal-400">
              <PenTool className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mb-1">১০০% নিখুঁত যুক্তবর্ণ</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ক্যানভাস এরর মুক্ত—Puppeteer ইঞ্জিনে প্রতিটি বাংলা অক্ষর ও মাত্রা নিখুঁত রেন্ডার হয়।
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 sm:mb-4 text-amber-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mb-1">স্মার্ট Gemini AI স্লোগান</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              প্রার্থীর দল, পদবি ও এলাকা দেখে এআই নিজে থেকে আকর্ষণীয় রাজনৈতিক স্লোগান লিখে দেয়।
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3 sm:mb-4 text-rose-400">
              <Zap className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mb-1">৩টি সহজ ধাপে পোস্টার</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              টেমপ্লেট বাছাই → নাম ও ছবি প্রদান → মুহূর্তেই তৈরি হয়ে যাবে আপনার সম্পূর্ণ পোস্টার।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Hero;
