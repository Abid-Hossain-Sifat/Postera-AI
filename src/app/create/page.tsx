"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPoster, getPosterById, regeneratePoster, getTemplateById, getAuthToken, downloadFile, getPosterPdfUrl } from "@/lib/Data";
import { toast } from "react-toastify";
import PhotoUpload from "@/Components/PhotoUpload";
import PosterLivePreview from "@/Components/poster/PosterLivePreview";
import Link from "next/link";
import {
  Flag, Vote, Moon, Heart, Mic, Sparkles, Image as ImageIcon,
  AlertTriangle, ShieldCheck, Check, Layers, UserCheck, Eye, Download, FileDown
} from "lucide-react";

const MAX_RETRIES = 3;

const OCCASIONS = [
  { value: "victoryDay", label: "মহান বিজয় দিবস", icon: Flag },
  { value: "campaign", label: "নির্বাচনী প্রচারণা", icon: Vote },
  { value: "eid", label: "ঈদ মোবারক / উৎসব", icon: Moon },
  { value: "condolence", label: "শোক প্রস্তাব / শ্রদ্ধাঞ্জলি", icon: Heart },
  { value: "conference", label: "কর্মী সম্মেলন", icon: Mic },
  { value: "greeting", label: "শুভেচ্ছা পোস্টার", icon: Sparkles },
];

const DEFAULT_SLOGANS: Record<string, string> = {
  victoryDay: "সকল বীর শহীদ ও মুক্তিযোদ্ধাদের প্রতি বিনম্র শ্রদ্ধাঞ্জলি",
  campaign: "আপনার মূল্যবান ভোট ও দোয়া প্রার্থনা করছি",
  eid: "পবিত্র ঈদ মোবারক — আনন্দ ছড়িয়ে পড়ুক সবার মাঝে",
  condolence: "আমরা আপনার বিদেহী আত্মার মাগফিরাত ও চিরশান্তি কামনা করি",
  conference: "দেশ গড়ার প্রত্যয়ে একতাবদ্ধ হোন — সম্মেলন সফল করুন",
  greeting: "নতুন দায়িত্ব ও গৌরবময় পথচলায় আন্তরিক শুভকামনা",
  greetings: "নতুন দায়িত্ব ও গৌরবময় পথচলায় আন্তরিক শুভকামনা",
};

const TEMPLATE_STYLES = [
  {
    id: "formal",
    label: "ফরমাল / মার্জিত",
    desc: "দ্বৈত সোনালী বর্ডার ও সুষম আনুষ্ঠানিক বিন্যাস",
    icon: ShieldCheck,
  },
  {
    id: "photoFocus",
    label: "ফটো-ফোকাসড",
    desc: "বড় প্রতিকৃতি, উজ্জ্বল হ্যালো ও শক্তিশালী উপস্থিতি",
    icon: Sparkles,
  },
  {
    id: "occasion",
    label: "উপলক্ষ / উৎসব",
    desc: "জমকালো শীর্ষ ব্যানার ও বিশেষ উৎসবীয় কালার",
    icon: Flag,
  },
];

const DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "ময়মনসিংহ",
  "রংপুর", "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "ফরিদপুর",
  "যশোর", "নোয়াখালী", "বগুড়া", "পাবনা", "দিনাজপুর", "কক্সবাজার", "ব্রাহ্মণবাড়িয়া",
];

type Status = "idle" | "generating" | "polling" | "completed" | "failed";

const CreatePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";

  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [posterId, setPosterId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [templateImage, setTemplateImage] = useState<string>("/templates/campaign.svg");
  const [photos, setPhotos] = useState<File[]>([]);
  const [templateStyle, setTemplateStyle] = useState<"formal" | "photoFocus" | "occasion">("formal");
  const [viewTab, setViewTab] = useState<"template" | "live" | "hd">("template");

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
      if (t) {
        if (t.title) setTemplateTitle(t.title);
        const resolvedImage = t.posterUrl || t.thumbnailUrl || t.thumbnail || "/templates/campaign.svg";
        setTemplateImage(resolvedImage);

        const rawCat = t.categoryType || t.category || t.occasion;
        if (rawCat) {
          const occ = rawCat === "greetings" ? "greeting" : rawCat;
          const slogan = DEFAULT_SLOGANS[rawCat] || DEFAULT_SLOGANS[occ] || "আপনার দোয়া ও সমর্থন প্রত্যাশী";
          setFormData((f) => ({
            ...f,
            occasion: occ,
            slogan: (!f.name || f.slogan === "আপনার দোয়া ও সমর্থন প্রত্যাশী") ? slogan : f.slogan,
          }));

          if (occ === "victoryDay" || occ === "eid") {
            setTemplateStyle("occasion");
          } else if (occ === "campaign" || occ === "conference") {
            setTemplateStyle("photoFocus");
          } else {
            setTemplateStyle("formal");
          }
        }
      }
    });
  }, [templateId]);

  // Status polling
  useEffect(() => {
    if (status !== "polling" || !posterId) return;
    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > 60) {
        clearInterval(interval);
        setStatus("failed");
        toast.error("পোস্টার তৈরিতে বিলম্ব হচ্ছে, ড্যাশবোর্ডে পোস্টার সংরক্ষিত থাকবে।");
        return;
      }
      try {
        const data = await getPosterById(posterId);
        if (data && data.status === "completed" && data.generatedImageUrl) {
          clearInterval(interval);
          setPreview(data.generatedImageUrl);
          setStatus("completed");
          setViewTab("hd");
          toast.success("পোস্টার সফলভাবে তৈরি হয়েছে!");
        } else if (data && data.status === "failed") {
          clearInterval(interval);
          setStatus("failed");
          toast.error("পোস্টার তৈরি করা সম্ভব হয়নি।");
        }
      } catch {
        // Keep polling on transient network hitch
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [status, posterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      toast.warning("পোস্টার তৈরি করতে অনুগ্রহ করে প্রথমে লগইন করুন।");
      router.push("/login");
      return;
    }
    if (formData.name.trim() === "") {
      toast.error("নাম দেওয়া আবশ্যক।");
      return;
    }
    setStatus("generating");
    setPreview(null);
    try {
      const res = await createPoster({
        ...formData,
        templateId,
        templateStyle,
        photos,
      });
      const id = res._id || res.id;
      if (id) {
        setPosterId(id);
        if (res.generatedImageUrl) {
          setPreview(res.generatedImageUrl);
          setStatus("completed");
          setViewTab("hd");
          toast.success("পোস্টার সফলভাবে তৈরি হয়েছে!");
        } else {
          setStatus("polling");
        }
      } else if (res.imageUrl) {
        setPreview(res.imageUrl);
        setStatus("completed");
        setViewTab("hd");
        toast.success("পোস্টার সফলভাবে তৈরি হয়েছে!");
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
          setViewTab("hd");
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
    setViewTab("hd");
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
            প্রফেশনাল পোস্টার মেকার
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            বাংলাদেশের ঐতিহ্যবাহী রাজনৈতিক ও ইভেন্ট পোস্টার স্টাইলে ১২০০x১৬০০ প্রিন্ট-রেডি আউটপুট।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Form ───────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">

            {/* Selected Template Banner Card */}
            <div className="flex items-center gap-3.5 mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-lg">
              <div className="w-14 h-20 rounded-lg overflow-hidden border border-amber-400/40 shrink-0 bg-slate-900 shadow">
                <img
                  src={templateImage}
                  alt={templateTitle || "টেমপ্লেট"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    এডিটের জন্য নির্বাচিত টেমপ্লেট
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {templateTitle || "নির্বাচনী প্রচারণা পোস্টার"}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  উপলক্ষ: {OCCASIONS.find((o) => o.value === formData.occasion)?.label || formData.occasion}
                </p>
              </div>
              <Link
                href="/templates"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 hover:text-amber-300 border border-slate-700 transition-colors shrink-0"
              >
                বদলান
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Template Style Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  ডিজাইন টেমপ্লেট নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEMPLATE_STYLES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = templateStyle === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplateStyle(t.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-400/80 text-amber-300 ring-1 ring-amber-400/30 shadow-md shadow-amber-500/10"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{t.label}</p>
                          <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug line-clamp-1">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occasion type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  উপলক্ষ নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OCCASIONS.map((o) => {
                    const IconComp = o.icon;
                    const isSelected = formData.occasion === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setFormData((f) => ({ ...f, occasion: o.value }))}
                        className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-400/60 text-amber-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                        <span>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  পোস্টারে প্রার্থীর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all placeholder-slate-600"
                  placeholder="প্রার্থীর পূর্ণ নাম লিখুন"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  পদবি / রাজনৈতিক পরিচয়
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all placeholder-slate-600"
                  placeholder="পদবি বা দলীয় পরিচয় লিখুন"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all placeholder-slate-600"
                  placeholder="দল বা সংগঠনের নাম লিখুন"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 outline-none transition-all"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all placeholder-slate-600"
                    placeholder="থানা বা ইউনিয়নের নাম লিখুন"
                  />
                </div>
              </div>

              {/* Slogan / Headline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    হেডলাইন / মূল স্লোগান <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    প্রিন্ট রেডি
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none resize-none transition-all placeholder-slate-600"
                  placeholder="পোস্টারে মূল হেডলাইন বা স্লোগান লিখুন..."
                />
              </div>

              {/* Photo Upload */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <PhotoUpload
                  maxPhotos={3}
                  onPhotosChange={setPhotos}
                  label="নেতা বা প্রার্থীর ছবি আপলোড করুন (১-৩টি)"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  * ১টি ছবি দিলে হিরো আর্চ পোর্ট্রেট, ২টি ছবি দিলে ভারসাম্যপূর্ণ কার্ড, এবং ৩টি দিলে পিরামিড হায়ারার্কি সাজানো হবে।
                </p>
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

              {/* Submit Button */}
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    AI পোস্টার প্রসেস হচ্ছে...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    ১২০০x১৬০০ HD পোস্টার তৈরি করুন
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Preview Panel ───────────────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow">
              <button
                type="button"
                onClick={() => setViewTab("template")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  viewTab === "template"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>মূল টেমপ্লেট</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab("live")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  viewTab === "live"
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>লাইভ ড্রাফট</span>
              </button>
              {status === "completed" && preview && (
                <button
                  type="button"
                  onClick={() => setViewTab("hd")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    viewTab === "hd"
                      ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>জেনারেটেড HD</span>
                </button>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-6 min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">

              {/* View 1: Original Chosen Template */}
              {viewTab === "template" && (
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full max-w-[440px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/60 bg-slate-950">
                    <img
                      src={templateImage}
                      alt={templateTitle || "Template Preview"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>নির্বাচিত মূল টেমপ্লেট</span>
                    </div>
                    <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-center">
                      <p className="text-xs font-bold text-white mb-0.5">{templateTitle}</p>
                      <p className="text-[11px] text-amber-400">
                        বামের ফর্মে আপনার নাম ও ছবি দিলে এআই এই স্টাইলেই পোস্টার বানিয়ে দিবে
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* View 2: Interactive Live Draft */}
              {viewTab === "live" && (
                <div className="relative w-full flex flex-col items-center">
                  <PosterLivePreview
                    formData={formData}
                    photos={photos}
                    templateStyle={templateStyle}
                  />
                </div>
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 text-center px-4 z-30">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-amber-400 rounded-full animate-spin" />
                    <div
                      className="absolute inset-2 border-4 border-t-yellow-300 rounded-full animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                    />
                  </div>
                  <div>
                    <p className="text-amber-400 font-black text-base animate-pulse">
                      {status === "generating" ? "AI ডিজাইন ইঞ্জিন সক্রিয়..." : "হাই-রেস রেন্ডার প্রস্তুত হচ্ছে..."}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Gemini Layout Assistant + Puppeteer HD Engine
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    {["বাংলা ফন্ট লোড", "ডায়নামিক লেআউট", "ছবি কম্পোজিশন", "১২০০x১৬০০ রেন্ডার"].map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.25}s` }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed state */}
              {status === "failed" && (
                <div className="text-center px-4 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <p className="text-rose-400 font-bold text-sm mb-1">পোস্টার তৈরি সম্ভব হয়নি</p>
                  <p className="text-slate-500 text-xs mb-4">
                    সার্ভার বা রেন্ডারিং প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-xs border border-slate-700"
                  >
                    পুনরায় চেষ্টা করুন
                  </button>
                </div>
              )}

              {/* Completed state */}
              {status === "completed" && preview && (
                <div className="w-full">
                  {/* View Mode Switcher */}
                  <div className="flex items-center justify-between mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewTab("hd")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        viewTab === "hd"
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>জেনারেটেড HD পোস্টার (1200x1600)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewTab("live")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        viewTab === "live"
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>লাইভ ড্রাফট প্রিভিউ</span>
                    </button>
                  </div>

                  {/* Display HD or Live */}
                  {viewTab === "hd" ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/50 mb-5">
                      <img
                        src={preview}
                        alt="Generated High-Resolution Poster"
                        className="w-full h-auto object-contain max-h-[620px] mx-auto block"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow-lg flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>1200x1600 PRINT READY</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 flex justify-center">
                      <PosterLivePreview
                        formData={formData}
                        photos={photos}
                        templateStyle={templateStyle}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        toast.info("HD ইমেজ ডাউনলোড হচ্ছে...");
                        downloadFile(preview, `postera_${posterId || "poster"}.png`);
                      }}
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-center font-black rounded-xl hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 text-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      HD পোস্টার ডাউনলোড (PNG)
                    </button>

                    {posterId && (
                      <button
                        onClick={() => {
                          toast.info("প্রিন্ট-রেডি PDF প্রস্তুত হচ্ছে...");
                          downloadFile(getPosterPdfUrl(posterId), `postera_${posterId}.pdf`);
                        }}
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-center font-black rounded-xl hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
                      >
                        <FileDown className="w-4 h-4 stroke-[2.5]" />
                        প্রিন্ট-রেডি PDF ডাউনলোড (A4)
                      </button>
                    )}

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

            {/* Quality & Security badge */}
            <p className="text-[11px] text-slate-500 text-center leading-relaxed flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>প্রকৃত বাংলা ফন্ট ও ১২০০x১৬০০ হাই-ডেফিনিশন রেজোলিউশনে রেন্ডার হয়।</span>
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
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">লোডিং...</p>
      </div>
    </div>
  }>
    <CreatePageContent />
  </Suspense>
);

export default CreatePage;
