import Link from "next/link";
import { Flag, Vote, Moon, Heart } from "lucide-react";

const templates = [
  {
    id: "1",
    title: "মহান বিজয় দিবস",
    category: "victoryDay",
    icon: Flag,
    image: "/templates/victory-day.svg",
    badge: "জনপ্রিয়",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "2",
    title: "নির্বাচনী প্রচারণা",
    category: "campaign",
    icon: Vote,
    image: "/templates/campaign.svg",
    badge: "হট",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
  {
    id: "3",
    title: "ঈদ মোবারক",
    category: "eid",
    icon: Moon,
    image: "/templates/eid.svg",
    badge: "সিজনাল",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "4",
    title: "শোক ও শ্রদ্ধাঞ্জলি",
    category: "condolence",
    icon: Heart,
    image: "/templates/condolence.svg",
    badge: "ফ্রি",
    badgeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
];

const FeaturedTemplates = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-900/40">
      <div className="w-[95%] lg:max-w-[80%] mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold mb-3 uppercase tracking-widest">
              পোস্টার টেমপ্লেট
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              জনপ্রিয় ডিজাইন ক্যাটাগরি
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              প্রতিটি উপলক্ষের জন্য বিশেষভাবে তৈরি পেশাদার টেমপ্লেট।
            </p>
          </div>
          <Link
            href="/templates"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
          >
            সব টেমপ্লেট দেখুন
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/create?template=${t.id}`}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5"
            >
              {/* Visual preview */}
              <div className="aspect-[3/4] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
                <img
                  src={t.image}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>

                {/* Badge */}
                <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${t.badgeColor} backdrop-blur-md`}>
                  {t.badge}
                </div>
              </div>

              {/* Title */}
              <div className="p-3 md:p-4">
                <h3 className="text-white text-xs md:text-sm font-bold leading-tight">
                  {t.title}
                </h3>
                <p className="text-emerald-400 text-[10px] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  এখনই তৈরি করুন →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 font-semibold text-sm hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            সম্পূর্ণ টেমপ্লেট গ্যালারি দেখুন
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTemplates;
