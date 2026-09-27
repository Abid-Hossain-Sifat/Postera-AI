"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getPosterById, regeneratePoster, downloadFile, getPosterPdfUrl } from "@/lib/Data";
import { toast } from "react-toastify";
import Link from "next/link";
import { Palette, AlertTriangle, Check, FileDown, Download, Copy } from "lucide-react";

const MAX_RETRIES = 3;
type PosterStatus = "loading" | "generating" | "completed" | "failed";

interface PosterData {
  status: string;
  generatedImageUrl?: string;
  retryCount?: number;
  formData?: {
    name?: string;
    designation?: string;
    party?: string;
    district?: string;
    occasion?: string;
    slogan?: string;
  };
}

const PosterPage = () => {
  const pathname = usePathname();
  const posterId = pathname?.split("/").pop() || "";

  const [poster, setPoster] = useState<PosterData | null>(null);
  const [uiStatus, setUiStatus] = useState<PosterStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [pollingCount, setPollingCount] = useState(0);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchPoster = useCallback(async () => {
    if (!posterId) return;
    try {
      const data = await getPosterById(posterId);
      setPoster(data);
      setRetryCount(data.retryCount || 0);
      if (data.status === "completed" && data.generatedImageUrl) {
        setUiStatus("completed");
      } else if (data.status === "failed") {
        setUiStatus("failed");
      } else {
        setUiStatus("generating");
      }
    } catch {
      setUiStatus("failed");
    }
  }, [posterId]);

  useEffect(() => { fetchPoster(); }, [fetchPoster]);

  useEffect(() => {
    if (uiStatus !== "generating") return;
    if (pollingCount >= 40) {
      setUiStatus("failed");
      toast.error("টাইমআউট — পোস্টার তৈরি হয়নি।");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await getPosterById(posterId);
        setPoster(data);
        if (data.status === "completed" && data.generatedImageUrl) {
          setUiStatus("completed");
          toast.success("পোস্টার তৈরি হয়েছে!");
        } else if (data.status === "failed") {
          setUiStatus("failed");
          toast.error("পোস্টার তৈরি করা সম্ভব হয়নি।");
        } else {
          setPollingCount((c) => c + 1);
        }
      } catch {
        setPollingCount((c) => c + 1);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [uiStatus, pollingCount, posterId]);

  const handleRegenerate = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("সর্বোচ্চ " + MAX_RETRIES + "বার রিজেনারেট করা যাবে।");
      return;
    }
    setUiStatus("generating");
    setPollingCount(0);
    try {
      await regeneratePoster(posterId);
      setRetryCount((c) => c + 1);
      toast.info("পুনরায় তৈরি হচ্ছে...");
    } catch {
      setUiStatus("failed");
      toast.error("রিজেনারেট করা সম্ভব হয়নি।");
    }
  };

  if (uiStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">পোস্টার লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const imageUrl = poster?.generatedImageUrl;
  const info = poster?.formData;

  return (
    <div className="min-h-screen bg-slate-950 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            আমার পোস্টার
          </Link>
          <span className="text-slate-700">/</span>
          <span className="font-mono truncate max-w-32">{posterId.slice(0, 16)}...</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-2xl">
              {uiStatus === "generating" && (
                <div className="aspect-[3/4] rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center gap-5">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-2 border-4 border-t-teal-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Palette className="w-7 h-7 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-emerald-400 font-black text-lg animate-pulse mb-1">পোস্টার তৈরি হচ্ছে...</p>
                    <p className="text-slate-500 text-xs">Gemini AI ও Puppeteer কাজ করছে</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {["বাংলা ফন্ট রেন্ডার", "ছবি প্রসেসিং", "লেআউট তৈরি", "HD এক্সপোর্ট"].map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: i * 0.4 + "s" }} />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {uiStatus === "failed" && (
                <div className="aspect-[3/4] rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-10 h-10 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-rose-400 font-black text-lg mb-1">পোস্টার তৈরি হয়নি</p>
                    <p className="text-slate-500 text-sm">সার্ভার ব্যস্ত বা নেটওয়ার্ক সমস্যা হয়েছে।</p>
                  </div>
                  {retryCount < MAX_RETRIES && (
                    <button onClick={handleRegenerate} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all text-sm">
                      পুনরায় চেষ্টা করুন
                    </button>
                  )}
                </div>
              )}

              {uiStatus === "completed" && imageUrl && (
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                  <img src={imageUrl} alt="Generated Poster" className="w-full" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full shadow flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>প্রিন্ট রেডি</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className={"p-4 rounded-xl border " + (uiStatus === "completed" ? "bg-emerald-500/10 border-emerald-500/30" : uiStatus === "failed" ? "bg-rose-500/10 border-rose-500/30" : "bg-slate-900 border-slate-800")}>
              <div className="flex items-center gap-2 mb-1">
                <span className={"w-2 h-2 rounded-full " + (uiStatus === "completed" ? "bg-emerald-400" : uiStatus === "failed" ? "bg-rose-400" : "bg-amber-400 animate-pulse")} />
                <span className={"text-xs font-bold uppercase tracking-wider " + (uiStatus === "completed" ? "text-emerald-400" : uiStatus === "failed" ? "text-rose-400" : "text-amber-400")}>
                  {uiStatus === "generating" ? "তৈরি হচ্ছে..." : uiStatus === "completed" ? "সম্পন্ন" : "ব্যর্থ"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">ID: {posterId.slice(0, 16)}...</p>
            </div>

            {uiStatus === "completed" && imageUrl && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ডাউনলোড ও এক্সপোর্ট</h3>
                
                {/* PNG Download */}
                <button
                  disabled={downloadingImage}
                  onClick={async () => {
                    setDownloadingImage(true);
                    toast.info("HD ইমেজ ডাউনলোড হচ্ছে...");
                    await downloadFile(imageUrl, `postera_${posterId}.png`);
                    setDownloadingImage(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-100 transition-all text-sm shadow cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 stroke-[2.5] ${downloadingImage ? "animate-bounce" : ""}`} />
                  {downloadingImage ? "ডাউনলোড হচ্ছে..." : "HD ইমেজ ডাউনলোড (PNG)"}
                </button>

                {/* PDF Download */}
                <button
                  disabled={downloadingPdf}
                  onClick={async () => {
                    setDownloadingPdf(true);
                    toast.info("প্রিন্ট-রেডি PDF প্রস্তুত হচ্ছে...");
                    await downloadFile(getPosterPdfUrl(posterId), `postera_${posterId}.pdf`);
                    setDownloadingPdf(false);
                    toast.success("PDF ডাউনলোড সম্পন্ন হয়েছে!");
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl hover:opacity-90 transition-all text-sm shadow cursor-pointer disabled:opacity-50"
                >
                  <FileDown className={`w-4 h-4 stroke-[2.5] ${downloadingPdf ? "animate-bounce" : ""}`} />
                  {downloadingPdf ? "PDF তৈরি হচ্ছে..." : "প্রিন্ট-রেডি PDF ডাউনলোড (A4)"}
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("পোস্টার লিংক কপি হয়েছে!");
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 text-slate-200 font-bold rounded-xl hover:bg-slate-700 transition-all text-xs border border-slate-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  পোস্টার লিংক কপি করুন
                </button>
              </div>
            )}

            {(uiStatus === "completed" || uiStatus === "failed") && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">রিজেনারেট</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>ব্যবহৃত</span>
                    <span className="font-bold text-slate-300">{retryCount}/{MAX_RETRIES}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: (retryCount / MAX_RETRIES * 100) + "%" }} />
                  </div>
                </div>
                <button onClick={handleRegenerate} disabled={retryCount >= MAX_RETRIES} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  রিজেনারেট করুন
                </button>
              </div>
            )}

            {info && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">পোস্টারের তথ্য</h3>
                <div className="space-y-2">
                  {[{ label: "নাম", value: info.name }, { label: "পদবি", value: info.designation }, { label: "দল", value: info.party }, { label: "জেলা", value: info.district }, { label: "উপলক্ষ", value: info.occasion }].filter((f) => f.value).map((f) => (
                    <div key={f.label} className="flex justify-between gap-2">
                      <span className="text-[11px] text-slate-500">{f.label}:</span>
                      <span className="text-[11px] text-slate-300 font-medium text-right">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/dashboard" className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl hover:border-slate-700 transition-all text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H7m0 0l5-5m-5 5l5 5" />
                </svg>
                ড্যাশবোর্ড
              </Link>
              <Link href="/templates" className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-xl hover:bg-emerald-500/20 transition-all text-xs">
                নতুন পোস্টার
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterPage;
