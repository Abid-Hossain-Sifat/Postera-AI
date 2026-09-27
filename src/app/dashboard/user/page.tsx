"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Sparkles, Download, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { getUserPosters, deletePoster, getAuthToken, PosterRecord } from "@/lib/Data";
import { toast } from "react-toastify";

export default function UserDashboardPage() {
  const router = useRouter();
  const [posters, setPosters] = useState<PosterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosters = async () => {
    setLoading(true);
    try {
      const data = await getUserPosters();
      setPosters(Array.isArray(data) ? data : []);
    } catch {
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchPosters();
  }, [router]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পোস্টারটি মুছে ফেলতে চান?")) return;
    try {
      await deletePoster(id);
      setPosters((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success("পোস্টার সফলভাবে মুছে ফেলা হয়েছে");
    } catch {
      toast.error("পোস্টার মুছতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-7 h-7 text-emerald-400" />
            <span>আমার পোস্টার হিস্ট্রি</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            আপনার অ্যাকাউন্ট থেকে তৈরি করা পোস্টারগুলো দেখুন এবং পুনরায় ডাউনলোড করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosters}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>নতুন পোস্টার তৈরি</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">পোস্টার লোড হচ্ছে...</p>
        </div>
      ) : posters.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">কোনো পোস্টার পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-400 mb-6">
            আপনি এখনও কোনো রাজনৈতিক পোস্টার তৈরি করেননি।
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            পোস্টার তৈরি শুরু করুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => {
            const id = poster._id || poster.id;
            const imgUrl = poster.generatedImageUrl || poster.imageUrl;
            const title =
              poster.formData?.name ||
              poster.formData?.slogan ||
              poster.title ||
              "রাজনৈতিক পোস্টার";

            return (
              <div
                key={id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-3">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                        <span>ছবি তৈরি হচ্ছে...</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          poster.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : poster.status === "failed"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {poster.status === "completed"
                          ? "প্রিন্ট রেডি"
                          : poster.status === "failed"
                          ? "ব্যর্থ"
                          : "প্রক্রিয়াধীন"}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {poster.formData?.designation || poster.date || "AI জেনারেটেড"}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {imgUrl && (
                      <a
                        href={imgUrl}
                        download={`postera_${id}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    {id && (
                      <Link
                        href={`/poster/${id}`}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="বিস্তারিত দেখুন"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  {id && (
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
