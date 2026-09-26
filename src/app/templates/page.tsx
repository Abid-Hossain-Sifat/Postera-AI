"use client";
import { useEffect, useState } from "react";
import { getTemplates } from "@/lib/Data";
import Link from "next/link";

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const filtered = activeTab === "all" ? templates : templates.filter(t => t.category === activeTab);

  const categories = [
    { id: "all", name: "সবগুলো" },
    { id: "victoryDay", name: "বিজয় দিবস" },
    { id: "campaign", name: "নির্বাচন" },
    { id: "eid", name: "ঈদ" },
    { id: "condolence", name: "শোক দিবস" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="w-[95%] lg:max-w-[80%] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            পোস্টার টেমপ্লেট গ্যালারি
          </h1>
          <p className="text-slate-400">আপনার পছন্দের উপলক্ষ অনুযায়ী ডিজাইন বাছাই করুন</p>
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                activeTab === tab.id 
                ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded uppercase">
                  {item.occasion || 'স্পেশাল'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-4 line-clamp-1">{item.title}</h3>
                <Link href={`/create?template=${item.id}`} className="block w-full py-2.5 text-center bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs rounded-xl transition-all">
                  ডিজাইনটি এডিট করুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;