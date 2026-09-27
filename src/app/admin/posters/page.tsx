"use client";

import { useState, useEffect } from "react";
import { getAdminPosters, toggleFlagAdminPoster } from "@/lib/Data";
import {
  ShieldAlert,
  Flag,
  FlagOff,
  Filter,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  X,
} from "lucide-react";

export type PosterStatus = "completed" | "generating" | "failed" | "draft";

export interface PosterUser {
  name: string;
  email: string;
}

export interface PosterTemplate {
  title: string;
}

export interface PosterItem {
  _id: string;
  user: PosterUser;
  template: PosterTemplate;
  generatedImageUrl: string;
  status: PosterStatus;
  flagged: boolean;
  createdAt: string;
}

const initialPosters: PosterItem[] = [
  {
    _id: "p1",
    user: { name: "ব্যবহারকারী ১", email: "user1@example.com" },
    template: { title: "নির্বাচনী প্রচারণা পোস্টার" },
    generatedImageUrl: "/templates/campaign.svg",
    status: "completed",
    flagged: false,
    createdAt: "2024-12-12",
  },
  {
    _id: "p2",
    user: { name: "ব্যবহারকারী ২", email: "user2@example.com" },
    template: { title: "মহান বিজয় দিবস ২০২৪" },
    generatedImageUrl: "/templates/victory-day.svg",
    status: "completed",
    flagged: true,
    createdAt: "2024-12-10",
  },
  {
    _id: "p3",
    user: { name: "ব্যবহারকারী ৩", email: "user3@example.com" },
    template: { title: "পবিত্র ঈদ মোবারক শুভেচ্ছা" },
    generatedImageUrl: "/templates/eid.svg",
    status: "failed",
    flagged: false,
    createdAt: "2024-12-08",
  },
  {
    _id: "p4",
    user: { name: "ব্যবহারকারী ৪", email: "user4@example.com" },
    template: { title: "বিনম্র শ্রদ্ধাঞ্জলি ও শোক দিবস" },
    generatedImageUrl: "/templates/condolence.svg",
    status: "generating",
    flagged: false,
    createdAt: "2024-12-07",
  },
  {
    _id: "p5",
    user: { name: "নাসরিন আক্তার", email: "nasrin@gmail.com" },
    template: { title: "শুভেচ্ছা ও অভিনন্দন পোস্টার" },
    generatedImageUrl: "/templates/greetings.svg",
    status: "completed",
    flagged: false,
    createdAt: "2024-12-05",
  },
];

type FilterType = "all" | "completed" | "failed" | "flagged";

export default function AdminPostersPage() {
  const [posters, setPosters] = useState<PosterItem[]>(initialPosters);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [previewPoster, setPreviewPoster] = useState<PosterItem | null>(null);

  useEffect(() => {
    getAdminPosters().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPosters(
          data.map((p: any) => ({
            _id: p._id,
            user: p.userId
              ? { name: p.userId.name || "ব্যবহারকারী", email: p.userId.email || "user@postera.ai" }
              : { name: p.formData?.name || "ব্যবহারকারী", email: "user@postera.ai" },
            template: p.templateId
              ? { title: p.templateId.title || "পোস্টার" }
              : { title: p.formData?.occasion || "রাজনৈতিক পোস্টার" },
            generatedImageUrl: p.generatedImageUrl || "/templates/campaign.svg",
            status: p.status || "completed",
            flagged: !!p.flagged,
            createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString("bn-BD") : "আজ",
          }))
        );
      }
    });
  }, []);

  const handleToggleFlag = async (id: string) => {
    const item = posters.find((p) => p._id === id);
    if (!item) return;
    const nextFlag = !item.flagged;
    setPosters((prev) =>
      prev.map((poster) =>
        poster._id === id ? { ...poster, flagged: nextFlag } : poster
      )
    );
    try {
      await toggleFlagAdminPoster(id, nextFlag);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPosters = posters.filter((poster) => {
    if (activeFilter === "completed") return poster.status === "completed";
    if (activeFilter === "failed") return poster.status === "failed";
    if (activeFilter === "flagged") return poster.flagged;
    return true; // "all"
  });

  const renderStatusBadge = (status: PosterStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>সম্পন্ন</span>
          </span>
        );
      case "generating":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3 animate-spin" />
            <span>প্রক্রিয়াধীন</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>ব্যর্থ</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-400 border border-slate-600">
            <span>ড্রাফট</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>পোস্টার মডারেশন কিউ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              মোট {filteredPosters.length} টি পোস্টার
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            ইউজারদের জেনারেট করা পোস্টার পর্যালোচনা করুন এবং প্রয়োজনে ফ্লাগ করুন
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            সব ({posters.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "completed"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            সম্পন্ন ({posters.filter((p) => p.status === "completed").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("failed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "failed"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ব্যর্থ ({posters.filter((p) => p.status === "failed").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("flagged")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "flagged"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ফ্লাগড ({posters.filter((p) => p.flagged).length})
          </button>
        </div>

        <div className="text-xs font-medium text-slate-400 px-3">
          দেখানো হচ্ছে:{" "}
          <span className="text-white font-bold">{filteredPosters.length}</span>{" "}
          টি পোস্টার
        </div>
      </div>

      {/* Table Section */}
      {filteredPosters.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            কোন পোস্টার পাওয়া যায়নি
          </h3>
          <p className="text-sm text-slate-400">
            নির্বাচিত ফিল্টারের অধীনে এই মুহূর্তে কোনো পোস্টার নেই।
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ছবি</th>
                  <th className="py-4 px-6">ব্যবহারকারী</th>
                  <th className="py-4 px-6">টেমপ্লেট</th>
                  <th className="py-4 px-6">স্ট্যাটাস</th>
                  <th className="py-4 px-6">তারিখ</th>
                  <th className="py-4 px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredPosters.map((poster) => (
                  <tr
                    key={poster._id}
                    className={`transition-colors duration-150 ${
                      poster.flagged
                        ? "ring-1 ring-red-500/40 bg-red-950/10 hover:bg-red-950/20"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    {/* Thumbnail Column: 60x80px rounded-lg object-cover */}
                    <td className="py-4 px-6">
                      <div
                        onClick={() => setPreviewPoster(poster)}
                        className="w-[60px] h-[80px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer relative group shrink-0"
                      >
                        <img
                          src={poster.generatedImageUrl}
                          alt={poster.template.title}
                          className="w-[60px] h-[80px] rounded-lg object-cover group-hover:scale-110 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* User Column */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {poster.user.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {poster.user.email}
                        </span>
                      </div>
                    </td>

                    {/* Template Column */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-200">
                        {poster.template.title}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-6">
                      {renderStatusBadge(poster.status)}
                    </td>

                    {/* Date Column */}
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {poster.createdAt}
                      </span>
                    </td>

                    {/* Action Column: Flag / Unflag */}
                    <td className="py-4 px-6 text-right">
                      {poster.flagged ? (
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(poster._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                        >
                          <FlagOff className="w-3.5 h-3.5" />
                          <span>আনফ্লাগ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(poster._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                        >
                          <Flag className="w-3.5 h-3.5 text-slate-400" />
                          <span>ফ্লাগ</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Poster Preview Modal */}
      {previewPoster && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {previewPoster.template.title}
                </h3>
                <p className="text-xs text-slate-400">
                  ব্যবহারকারী: {previewPoster.user.name} ({previewPoster.user.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPoster(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-950 flex justify-center">
              <img
                src={previewPoster.generatedImageUrl}
                alt={previewPoster.template.title}
                className="max-h-[460px] rounded-xl object-contain shadow-2xl border border-slate-800"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>{renderStatusBadge(previewPoster.status)}</div>
              <div className="flex items-center gap-3">
                {previewPoster.flagged ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleFlag(previewPoster._id);
                      setPreviewPoster({
                        ...previewPoster,
                        flagged: false,
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FlagOff className="w-3.5 h-3.5" />
                    <span>আনফ্লাগ করুন</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleFlag(previewPoster._id);
                      setPreviewPoster({
                        ...previewPoster,
                        flagged: true,
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>ফ্লাগ করুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewPoster(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
