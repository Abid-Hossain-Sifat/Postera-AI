import { Palette, FileText, Sparkles } from "lucide-react";

const steps = [
  {
    number: "০১",
    icon: Palette,
    title: "টেমপ্লেট বাছাই করুন",
    desc: "বিজয় দিবস, নির্বাচনী প্রচারণা, ঈদ মোবারক বা শোক দিবস — আপনার উপলক্ষ অনুযায়ী প্রস্তুত পেশাদার ডিজাইন থেকে বেছে নিন।",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    textColor: "text-emerald-400",
  },
  {
    number: "০২",
    icon: FileText,
    title: "তথ্য ও ছবি প্রদান করুন",
    desc: "নাম, পদবি, দল, জেলা দিন। সর্বোচ্চ ৩টি নেতার ছবি আপলোড করুন। Gemini AI আপনার জন্য উপযুক্ত স্লোগানও লিখে দেবে।",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    textColor: "text-violet-400",
  },
  {
    number: "০৩",
    icon: Sparkles,
    title: "AI পোস্টার ডাউনলোড করুন",
    desc: "Gemini AI ও Puppeteer মিলে সেকেন্ডের মধ্যে তৈরি করবে ১০০% নিখুঁত বাংলা যুক্তবর্ণ সহ ৩০০ DPI প্রিন্ট-রেডি পোস্টার।",
    color: "from-amber-500 to-rose-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    textColor: "text-amber-400",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-950 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-transparent pointer-events-none" />

      <div className="w-[95%] lg:max-w-[80%] mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold mb-4 uppercase tracking-widest">
            সহজ ৩টি ধাপ
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            কিভাবে কাজ করে?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            কোনো ডিজাইন অভিজ্ঞতা ছাড়াই মাত্র কয়েক মিনিটে তৈরি করুন প্রফেশনাল মানের পোস্টার।
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-emerald-500/30 via-violet-500/30 to-amber-500/30" />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative bg-slate-900/60 border ${step.border} rounded-2xl p-6 md:p-7 hover:bg-slate-900/90 transition-all duration-300 group`}
            >
              {/* Step number badge */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-slate-950 font-black text-sm mb-5 shadow-lg relative z-10`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4`}>
                <step.icon className={`w-5 h-5 ${step.textColor}`} />
              </div>

              <h3 className={`text-base md:text-lg font-bold text-white mb-2.5 group-hover:${step.textColor} transition-colors`}>
                {step.title}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                {step.desc}
              </p>

              {/* Arrow for non-last items on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-14 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full items-center justify-center z-10 shadow-lg">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
