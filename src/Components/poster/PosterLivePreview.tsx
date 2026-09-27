"use client";
import React, { useEffect, useState } from "react";
import { Star, MapPin } from "lucide-react";

interface PosterLivePreviewProps {
  formData: {
    name: string;
    designation?: string;
    party: string;
    district?: string;
    unionThana?: string;
    occasion: string;
    slogan: string;
  };
  photos: File[];
  templateStyle?: "formal" | "photoFocus" | "occasion";
}

const OCCASION_TITLES: Record<string, string> = {
  victoryDay: "মহান বিজয় দিবস",
  campaign: "আসন্ন নির্বাচনী প্রচারণা",
  eid: "ঈদ মোবারক",
  condolence: "বিনম্র শ্রদ্ধাঞ্জলি",
  conference: "তৃণমূল কর্মী সম্মেলন ও সমাবেশ",
  greeting: "শুভেচ্ছা ও অভিনন্দন",
  greetings: "শুভেচ্ছা ও অভিনন্দন",
};

export default function PosterLivePreview({
  formData,
  photos,
  templateStyle = "formal",
}: PosterLivePreviewProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setPhotoUrls([]);
      return;
    }
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPhotoUrls(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photos]);

  const occ = formData.occasion || "campaign";
  const occasionTitle = OCCASION_TITLES[occ] || "রাজনৈতিক প্রচারণা";
  const candidateName = formData.name.trim() || "প্রার্থীর নাম এখানে বসবে";
  const designation = formData.designation?.trim() || "পদবী ও দলীয় পরিচয়";
  const party = formData.party.trim() || "দল বা সংগঠন";
  const locationParts = [formData.unionThana, formData.district].filter(Boolean);
  const locationText = locationParts.join(", ");
  const count = photoUrls.length;

  // Occasion-specific Theme Configs
  let bgGradient = "from-[#051329] via-[#0b2554] to-[#020814]";
  let accentColor = "#EAB308"; // Gold
  let borderColor = "#EAB308";
  let topBadgeText = "★ জনগণের সেবায় নিবেদিত প্রাণ ★";

  if (occ === "victoryDay") {
    bgGradient = "from-[#021f14] via-[#004d2c] to-[#01140d]";
    accentColor = "#FFD700";
    borderColor = "#F59E0B";
    topBadgeText = "★ ১৬ই ডিসেম্বর মহান বিজয় দিবস ★";
  } else if (occ === "eid") {
    bgGradient = "from-[#022115] via-[#05452d] to-[#00140b]";
    accentColor = "#FDE047";
    borderColor = "#EAB308";
    topBadgeText = "تقبل الله منا ومنكم — পবিত্র ঈদ মোবারক";
  } else if (occ === "condolence") {
    bgGradient = "from-[#111827] via-[#1f2937] to-[#0b0f17]";
    accentColor = "#E2E8F0"; // Silver
    borderColor = "#94A3B8";
    topBadgeText = "إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ";
  } else if (occ === "conference") {
    bgGradient = "from-[#1e1b4b] via-[#312e81] to-[#0f172a]";
    accentColor = "#F59E0B";
    borderColor = "#EAB308";
    topBadgeText = "★ ঐক্য • শৃঙ্খলা • প্রগতি ★";
  } else if (occ === "greeting" || occ === "greetings") {
    bgGradient = "from-[#2a0845] via-[#551270] to-[#19032b]";
    accentColor = "#FDE047";
    borderColor = "#F59E0B";
    topBadgeText = "★ ★ ★ ★ ★";
  }

  return (
    <div className="w-full max-w-[440px] mx-auto select-none">
      {/* 3:4 Aspect Ratio Canvas Container */}
      <div
        className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 text-white font-bangla flex flex-col justify-between bg-gradient-to-b ${bgGradient}`}
        style={{ borderColor: borderColor }}
      >
        {/* ── Background Motif Overlays ─────────────────────── */}
        
        {/* Victory Day: Red Sun & Monument */}
        {occ === "victoryDay" && (
          <>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-b from-[#ff3344] via-[#e61025] to-[#aa0515] opacity-80 shadow-2xl pointer-events-none" />
            {/* Monument Silhouette */}
            <svg className="absolute top-16 left-1/2 -translate-x-1/2 w-36 h-36 opacity-35 pointer-events-none" viewBox="0 0 100 100" fill="#01140d">
              <polygon points="50,10 46,90 54,90" />
              <polygon points="50,25 38,90 44,90" />
              <polygon points="50,25 56,90 62,90" />
              <polygon points="50,45 30,90 36,90" />
              <polygon points="50,45 64,90 70,90" />
            </svg>
          </>
        )}

        {/* Eid: Crescent Moon, Minarets & Fanus */}
        {occ === "eid" && (
          <>
            {/* Crescent Moon */}
            <svg className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-14 pointer-events-none opacity-80" viewBox="0 0 100 100" fill={accentColor}>
              <path d="M40,15 A35,35 0 1,0 85,75 A30,30 0 1,1 40,15 Z" />
              <polygon points="76,32 79,40 88,40 81,46 83,54 76,49 69,54 71,46 64,40 73,40" />
            </svg>
            {/* Mosque Minarets Silhouette */}
            <svg className="absolute bottom-28 left-0 right-0 w-full h-24 opacity-25 pointer-events-none" viewBox="0 0 600 100" preserveAspectRatio="none" fill="#011a10">
              <rect x="0" y="80" width="600" height="20" />
              <path d="M220,80 C220,40 380,40 380,80 Z" />
              <rect x="80" y="20" width="22" height="60" />
              <polygon points="91,5 75,20 107,20" />
              <rect x="498" y="20" width="22" height="60" />
              <polygon points="509,5 493,20 525,20" />
            </svg>
          </>
        )}

        {/* Condolence: Candle Flame */}
        {occ === "condolence" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            {/* Candle glow */}
            <div className="w-8 h-8 rounded-full bg-yellow-200/40 blur-md" />
            {/* Flame */}
            <div className="w-3.5 h-6 bg-gradient-to-t from-amber-400 via-yellow-200 to-white rounded-full -mt-5" />
            {/* Wick & Candle */}
            <div className="w-0.5 h-1.5 bg-slate-900" />
            <div className="w-3.5 h-8 bg-slate-300 rounded-t-sm shadow" />
          </div>
        )}

        {/* Campaign: Sunburst Rays & Symbol Seal */}
        {occ === "campaign" && (
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-conic-gradient(from_0deg,#ffffff_0deg_4deg,transparent_4deg_12deg)]" />
        )}

        {/* Greetings: Sparkles */}
        {(occ === "greeting" || occ === "greetings") && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <span className="absolute top-12 left-10 text-amber-300 text-lg">✦</span>
            <span className="absolute top-16 right-10 text-amber-300 text-sm">★</span>
            <span className="absolute bottom-36 left-12 text-amber-300 text-xs">✨</span>
            <span className="absolute bottom-40 right-12 text-amber-300 text-base">✦</span>
          </div>
        )}

        {/* Decorative Borders */}
        <div
          className="absolute inset-2.5 rounded-xl border pointer-events-none"
          style={{ borderColor: `${borderColor}88` }}
        />
        <div
          className="absolute inset-3.5 rounded-lg border border-dashed pointer-events-none opacity-40"
          style={{ borderColor: borderColor }}
        />

        {/* Corner Filigrees */}
        <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: borderColor }} />
        <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: borderColor }} />
        <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: borderColor }} />
        <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: borderColor }} />

        {/* ── Main Canvas Content ────────────────────────────── */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full justify-between">
          
          {/* Header */}
          <div className="text-center pt-0.5">
            {/* Top Occasion Pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[10px] font-bold tracking-wider mb-1 shadow-sm bg-black/40 backdrop-blur-sm"
              style={{ borderColor: `${borderColor}66`, color: accentColor }}
            >
              <span>{topBadgeText}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-base sm:text-xl font-black font-bangla-serif text-white tracking-wide leading-tight drop-shadow-md line-clamp-2 mt-0.5">
              {occ === "conference" ? "তৃণমূল কর্মী সম্মেলন ও সমাবেশ" : occasionTitle}
            </h2>

            {/* Slogan / Subtitle */}
            {formData.slogan && (
              <p
                className="text-[11px] font-semibold mt-1 line-clamp-1 drop-shadow"
                style={{ color: accentColor }}
              >
                {formData.slogan}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 w-2/3 mx-auto mt-1 opacity-60">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </div>

          {/* Dynamic Photo Area */}
          <div className="relative flex items-center justify-center my-auto py-1 min-h-[145px]">
            {count === 0 && (
              <div
                className="w-24 h-32 rounded-t-[40px] rounded-b-xl border-3 flex flex-col items-center justify-center bg-slate-950/70 shadow-2xl relative"
                style={{ borderColor: borderColor }}
              >
                <div className="w-12 h-12 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center mb-1">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[9px] font-bold text-amber-300">ছবি আপলোড করুন</span>
                <span className="text-[7.5px] text-slate-400">১-৩টি ছবি</span>
              </div>
            )}

            {count === 1 && (
              <div className="relative flex items-center justify-center">
                {/* Halo */}
                <div
                  className="absolute w-36 h-44 rounded-full filter blur-xl opacity-35"
                  style={{ backgroundColor: accentColor }}
                />
                <div
                  className={`relative overflow-hidden shadow-2xl border-4 rounded-t-[50px] rounded-b-xl bg-slate-900 ${
                    templateStyle === "photoFocus" ? "w-32 h-44 scale-105" : "w-28 h-38"
                  }`}
                  style={{ borderColor: borderColor }}
                >
                  <img
                    src={photoUrls[0]}
                    alt="Candidate"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Mourning ribbon if condolence */}
                  {occ === "condolence" && (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                      <div className="bg-black text-white text-[6px] font-bold transform rotate-45 text-center py-0.5 mt-2 -mr-3 shadow">
                        শোক
                      </div>
                    </div>
                  )}
                </div>

                {/* Campaign Election Symbol Badge */}
                {occ === "campaign" && (
                  <div className="absolute -right-12 bottom-2 w-12 h-12 rounded-full bg-white border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center text-slate-950 p-0.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-[7.5px] font-black leading-none">প্রতীক</span>
                  </div>
                )}
              </div>
            )}

            {count === 2 && (
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-24 h-34 rounded-t-[40px] rounded-b-xl overflow-hidden border-3 shadow-xl bg-slate-900"
                  style={{ borderColor: borderColor }}
                >
                  <img
                    src={photoUrls[0]}
                    alt="Candidate 1"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div
                  className="w-22 h-30 rounded-t-[36px] rounded-b-xl overflow-hidden border-2 shadow-lg bg-slate-900"
                  style={{ borderColor: `${borderColor}99` }}
                >
                  <img
                    src={photoUrls[1]}
                    alt="Candidate 2"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            )}

            {count >= 3 && (
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-30 rounded-t-[40px] rounded-b-lg overflow-hidden border-3 shadow-xl z-10 bg-slate-900"
                  style={{ borderColor: borderColor }}
                >
                  <img
                    src={photoUrls[0]}
                    alt="Primary Leader"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex gap-2.5 -mt-3 z-0">
                  <div className="w-18 h-22 rounded-t-[30px] rounded-b-lg overflow-hidden border-2 border-slate-300 shadow bg-slate-900">
                    <img
                      src={photoUrls[1]}
                      alt="Leader 2"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="w-18 h-22 rounded-t-[30px] rounded-b-lg overflow-hidden border-2 border-slate-300 shadow bg-slate-900">
                    <img
                      src={photoUrls[2]}
                      alt="Leader 3"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Information Area */}
          <div className="text-center space-y-1">
            <h3
              className="font-black font-bangla-serif text-white tracking-wide drop-shadow-md leading-tight text-base sm:text-lg"
              style={occ === "campaign" ? { color: "#ffffff" } : {}}
            >
              {candidateName}
            </h3>

            {designation && (
              <div
                className="inline-block py-0.5 px-3 border-y bg-black/40"
                style={{ borderColor: `${borderColor}55` }}
              >
                <p className="text-[11px] font-bold tracking-wide" style={{ color: accentColor }}>
                  {designation}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center flex-wrap gap-1.5 pt-0.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-200 font-semibold">
                {party}
              </span>
              {locationText && (
                <span
                  className="px-2 py-0.5 rounded-full bg-black/50 border text-[9.5px] font-medium flex items-center gap-0.5"
                  style={{ borderColor: `${borderColor}40`, color: accentColor }}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  {locationText}
                </span>
              )}
            </div>
          </div>

          {/* Footer Credit Bar */}
          <div
            className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5 mt-2 bg-gradient-to-t from-black via-slate-950/95 to-slate-900/90 border-t-2 px-3.5 py-1.5 flex items-center justify-between text-[10px]"
            style={{ borderTopColor: borderColor }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="font-black px-1.5 py-0.5 rounded text-[8.5px] tracking-wide text-slate-950"
                style={{ backgroundColor: accentColor }}
              >
                {occ === "condolence" ? "শোকান্তে:" : occ === "conference" ? "আহ্বানে:" : "শুভেচ্ছান্তে:"}
              </span>
              <span className="font-bold text-white text-[10px] truncate max-w-[150px]">
                {candidateName}
              </span>
            </div>
            <div className="text-right text-[9px] font-semibold truncate max-w-[120px]" style={{ color: accentColor }}>
              {party}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Active Notice */}
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          লাইভ প্রিভিউ (৩:৪ অনুপাত)
        </span>
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
          {occasionTitle} টেমপ্লেট
        </span>
      </div>
    </div>
  );
}
