"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createPoster, getPosterById, regeneratePoster, getTemplateById } from "@/lib/Data";
import { toast } from "react-toastify";
import PhotoUpload from "@/Components/PhotoUpload";
import Link from "next/link";
import { Flag, Vote, Moon, Heart, Mic, Sparkles, Image as ImageIcon, AlertTriangle, ShieldCheck, Check } from "lucide-react";

const MAX_RETRIES = 3;

const OCCASIONS = [
  { value: "victoryDay", label: "মহান বিজয় দিবস", icon: Flag },
  { value: "campaign", label: "নির্বাচনী প্রচারণা", icon: Vote },
  { value: "eid", label: "ঈদ মোবারক / উৎসব", icon: Moon },
  { value: "condolence", label: "শোক প্রস্তাব / শ্রদ্ধাঞ্জলি", icon: Heart },
  { value: "conference", label: "কর্মী সম্মেলন", icon: Mic },
  { value: "greeting", label: "শুভেচ্ছা পোস্টার", icon: Sparkles },
];

const DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "ময়মনসিংহ",
  "রংপুর", "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর",
  "যশোর", "নোয়াখালী", "বগুড়া", "পাবনা", "দিনাজপুর", "কক্সবাজার", "ব্রাহ্মণবাড়িয়া",
];

type Status = "idle" | "generating" | "polling" | "completed" | "failed";

const CreatePageContent = () => {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [posterId, setPosterId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    party: "",
    district: "",
    unionThana: "",
    occasion: "campaign",
    slogan: "আপনার দোয়া ও সমর্থন প্রত্যাশী",
  });

  // Load template info
  useEffect(() => {
    getTemplateById(templateId).then((t: any) => {
      if (t?.title) setTemplateTitle(t.title);
      if (t?.occasion && !formData.occasion) {
        setFormData((f) => ({ ...f, occasion: t.occasion }));
      }
    });
  }, [templateId]);

  // Status polling
  useEffect(() => {
    if (status !== "polling" || !posterId) return;
    const interval = setInterval(async () => {
      try {
        const data = await getPosterById(posterId);
        if (data.status === "completed" && data.generatedImageUrl) {
          clearInterval(interval);
          setPreview(data.generatedImageUrl);
          setStatus("completed");
          toast.success("পোস্টার তৈরি হয়েছে!");
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("failed");
          toast.error("পোস্টার তৈরি করা সম্ভব হয়নি।");
        }
      } catch {
        clearInterval(interval);
        setStatus("failed");
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [status, posterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() === "") {
      toast.error("নাম দেওয়া আবশ্যক।");
      return;
    }
    setStatus("generating");
    setPreview(null);
    try {
      const res = await createPoster({ ...formData, templateId, photos });
      const id = res._id || res.id;
      if (id) {
        setPosterId(id);
        // If response already has image (sync generation)
        if (res.generatedImageUrl) {
          setPreview(res.generatedImageUrl);
          setStatus("completed");
          toast.success("পোস্টার তৈরি হয়েছে!");
        } else {
          // Start polling for async generation
          setStatus("polling");
        }
      } else if (res.imageUrl) {
        // Fallback for simple API response
        setPreview(res.imageUrl);
        setStatus("completed");
        toast.success("পোস্টার তৈরি হয়েছে!");
      } else {
        throw new Error("No poster ID returned");
      }
    } catch {
      setStatus("failed");
      toast.error("পোস্টার তৈরি করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
    }
  };

  const handleRegenerate = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error(`সর্বোচ্চ ${MAX_RETRIES}বার রিজেনারেট করা যাবে।`);
      return;
    }
    setStatus("generating");
    setPreview(null);
    setRetryCount((c) => c + 1);
    try {
      if (posterId) {
        const res = await regeneratePoster(posterId);
        if (res.generatedImageUrl) {
          setPreview(res.generatedImageUrl);
          setStatus("completed");
        } else {
          setStatus("polling");
        }
        toast.info(`পুনরায় তৈরি হচ্ছে... (${retryCount + 1}/${MAX_RETRIES})`);
      } else {
        await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }
    } catch {
      setStatus("failed");
      toast.error("রিজেনারেট করা সম্ভব হয়নি।");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setPreview(null);
    setPosterId(null);
    setRetryCount(0);
  };

  const isLoading = status === "generating" || status === "polling";

  return (
    <div className="min-h-screen bg-slate-950 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/templates"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              টেমপ্লেট গ্যালারি
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-xs text-slate-500 truncate max-w-xs">
              {templateTitle || `টেমপ্লেট #${templateId}`}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            পোস্টার তৈরি করুন
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            তথ্য পূরণ করুন — AI নিজেই পোস্টার ডিজাইন করবে।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Form ───────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">

            {/* Template badge */}
            {templateTitle && (
              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <span className="text-xs text-slate-400">নির্বাচিত টেমপ্লেট:</span>
                <span className="text-xs font-bold text-emerald-400">{templateTitle}</span>
                <Link href="/templates" className="ml-auto text-[10px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">
                  পরিবর্তন করুন
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Occasion type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  উপলক্ষ নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OCCASIONS.map((o) => {
                    const IconComp = o.icon;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, occasion: o.value }))}
                        className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center gap-2 ${
                          formData.occasion === o.value
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  পোস্টারে নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-600"
                  placeholder="যেমন: মোঃ আব্দুল করিম"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  পদবি / পরিচয়
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-600"
                  placeholder="যেমন: সাধারণ সম্পাদক / সভাপতি"
                />
              </div>

              {/* Party */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  দল / সংগঠন <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-600"
                  placeholder="যেমন: সামাজিক সংগঠন বা দলের নাম"
                />
              </div>

              {/* District + Union row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    জেলা
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">জেলা বাছাই করুন</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    ইউনিয়ন / থানা
                  </label>
                  <input
                    type="text"
                    value={formData.unionThana}
                    onChange={(e) => setFormData({ ...formData, unionThana: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-600"
                    placeholder="যেমন: মিরপুর থানা"
                  />
                </div>
              </div>

              {/* Slogan / Headline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    হেডলাইন / স্লোগান <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    AI জেনারেটেড
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none resize-none transition-all placeholder-slate-600"
                  placeholder="পোস্টারে মূল হেডলাইন লিখুন..."
                />
              </div>

              {/* Photo Upload */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <PhotoUpload
                  maxPhotos={3}
                  onPhotosChange={setPhotos}
                  label="নেতার/প্রার্থীর ছবি আপলোড করুন (সর্বোচ্চ ৩টি)"
                />
              </div>

              {/* Retry counter */}
              {retryCount > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-amber-400 text-xs font-medium">
                    রিজেনারেট ব্যবহার হয়েছে: {retryCount}/{MAX_RETRIES}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    AI পোস্টার তৈরি হচ্ছে...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    পোস্টার তৈরি করুন
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Preview ───────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl md:rounded-3xl p-6 min-h-[480px] flex flex-col items-center justify-center relative overflow-hidden">

              {/* Idle state */}
              {status === "idle" && (
                <div className="text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-5 text-slate-400">
                    <ImageIcon className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">
                    পোস্টার প্রিভিউ এখানে দেখা যাবে
                  </p>
                  <p className="text-slate-600 text-xs">
                    বাম দিকে তথ্য পূরণ করে সাবমিট করুন
                  </p>
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-2 border-4 border-t-teal-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-black text-base animate-pulse">
                      {status === "generating" ? "AI রেন্ডারিং শুরু হচ্ছে..." : "পোস্টার প্রসেস হচ্ছে..."}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Gemini AI + Puppeteer ইঞ্জিন সক্রিয় আছে
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {["বাংলা ফন্ট লোড", "লেআউট সেট", "ছবি প্রসেস", "ফাইনাল রেন্ডার"].map((s, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[9px] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed state */}
              {status === "failed" && (
                <div className="text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <p className="text-rose-400 font-bold text-sm mb-1">পোস্টার তৈরি হয়নি</p>
                  <p className="text-slate-500 text-xs mb-4">
                    নেটওয়ার্ক বা সার্ভার সমস্যার কারণে ব্যর্থ হয়েছে।
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-xs"
                  >
                    আবার চেষ্টা করুন
                  </button>
                </div>
              )}

              {/* Completed state */}
              {status === "completed" && preview && (
                <div className="w-full">
                  {/* Poster image */}
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 mb-5">
                    <img
                      src={preview}
                      alt="Generated Poster"
                      className="w-full"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full shadow flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>READY TO PRINT</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <a
                      href={preview}
                      download="postera_ai_poster.jpg"
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-white text-slate-950 text-center font-black rounded-xl hover:bg-slate-100 transition-all shadow-lg text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      HD পোস্টার ডাউনলোড করুন
                    </a>

                    <div className="grid grid-cols-2 gap-2.5">
                      {retryCount < MAX_RETRIES ? (
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center justify-center gap-1.5 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-xs border border-slate-700"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          রিজেনারেট ({MAX_RETRIES - retryCount} বাকি)
                        </button>
                      ) : (
                        <div className="flex items-center justify-center py-3 bg-slate-900 text-slate-600 font-bold rounded-xl text-xs border border-slate-800">
                          রিজেনারেট শেষ
                        </div>
                      )}
                      <button
                        onClick={handleReset}
                        className="py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all text-xs border border-slate-700"
                      >
                        নতুন পোস্টার
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info note */}
            <p className="text-[11px] text-slate-600 text-center mt-3 leading-relaxed flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>আপনার আপলোড করা ছবি নিরাপদ। পোস্টার স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে সংরক্ষিত হবে।</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

const CreatePage = () => (
  <Suspense fallback={
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">লোডিং...</p>
      </div>
    </div>
  }>
    <CreatePageContent />
  </Suspense>
);

export default CreatePage;
