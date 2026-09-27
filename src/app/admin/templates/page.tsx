"use client";

import { useState, useEffect } from "react";
import {
  getAdminTemplates,
  createAdminTemplate,
  updateAdminTemplate,
  deleteAdminTemplate,
} from "@/lib/Data";
import {
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export type TemplateCategory =
  | "victoryDay"
  | "campaign"
  | "condolence"
  | "eid"
  | "greetings"
  | "conference";

export interface TemplateItem {
  _id: string;
  title: string;
  categoryType: TemplateCategory;
  thumbnailUrl: string;
  isActive: boolean;
}

const initialTemplates: TemplateItem[] = [
  {
    _id: "t1",
    title: "মহান বিজয় দিবস ২০২৪",
    categoryType: "victoryDay",
    thumbnailUrl: "/templates/victory-day.svg",
    isActive: true,
  },
  {
    _id: "t2",
    title: "নির্বাচনী প্রচারণা পোস্টার",
    categoryType: "campaign",
    thumbnailUrl: "/templates/campaign.svg",
    isActive: true,
  },
  {
    _id: "t3",
    title: "পবিত্র ঈদ মোবারক শুভেচ্ছা",
    categoryType: "eid",
    thumbnailUrl: "/templates/eid.svg",
    isActive: true,
  },
  {
    _id: "t4",
    title: "বিনম্র শ্রদ্ধাঞ্জলি ও শোক দিবস",
    categoryType: "condolence",
    thumbnailUrl: "/templates/condolence.svg",
    isActive: true,
  },
  {
    _id: "t5",
    title: "শুভেচ্ছা ও অভিনন্দন পোস্টার",
    categoryType: "greetings",
    thumbnailUrl: "/templates/greetings.svg",
    isActive: true,
  },
  {
    _id: "t6",
    title: "তৃণমূল কর্মী সম্মেলন ও সমাবেশ",
    categoryType: "conference",
    thumbnailUrl: "/templates/conference.svg",
    isActive: true,
  },
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getAdminTemplates().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(
          data.map((t: any) => ({
            _id: t._id || t.id,
            title: t.title,
            categoryType: t.categoryType,
            thumbnailUrl: t.posterUrl || t.thumbnailUrl || "/templates/campaign.svg",
            isActive: t.isActive !== false,
          }))
        );
      }
    });
  }, []);

  // New Template Inputs
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateCategory>("victoryDay");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [validationError, setValidationError] = useState("");

  const triggerSuccessAlert = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
  };

  const handleToggleActive = async (id: string) => {
    const item = templates.find((t) => t._id === id);
    if (!item) return;
    const nextState = !item.isActive;
    setTemplates((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isActive: nextState } : t))
    );
    try {
      await updateAdminTemplate(id, { isActive: nextState });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((item) => item._id !== id));
    triggerSuccessAlert("টেমপ্লেটটি সফলভাবে মুছে ফেলা হয়েছে!");
    try {
      await deleteAdminTemplate(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = () => {
    setNewTitle("");
    setNewCategory("victoryDay");
    setNewThumbnailUrl("/templates/campaign.svg");
    setNewIsActive(true);
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleAddTemplate = async () => {
    if (!newTitle.trim()) {
      setValidationError("অনুগ্রহ করে টেমপ্লেটের শিরোনাম লিখুন");
      return;
    }

    const payload = {
      title: newTitle.trim(),
      categoryType: newCategory,
      thumbnailUrl:
        newThumbnailUrl.trim() ||
        "/templates/campaign.svg",
      isActive: newIsActive,
    };

    try {
      const created = await createAdminTemplate(payload);
      const createdTemplate: TemplateItem = {
        _id: created._id || Date.now().toString(),
        title: payload.title,
        categoryType: payload.categoryType,
        thumbnailUrl: payload.thumbnailUrl,
        isActive: payload.isActive,
      };
      setTemplates((prev) => [createdTemplate, ...prev]);
    } catch {
      const createdTemplate: TemplateItem = {
        _id: Date.now().toString(),
        ...payload,
      };
      setTemplates((prev) => [createdTemplate, ...prev]);
    }

    setIsModalOpen(false);
    triggerSuccessAlert("নতুন টেমপ্লেট সফলভাবে যোগ করা হয়েছে!");
  };

  const renderCategoryBadge = (category: TemplateCategory) => {
    switch (category) {
      case "victoryDay":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            বিজয় দিবস
          </span>
        );
      case "campaign":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            নির্বাচন
          </span>
        );
      case "condolence":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/30">
            শোক
          </span>
        );
      case "eid":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            ঈদ
          </span>
        );
      case "greetings":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            শুভেচ্ছা
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
            অন্যান্য
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>টেমপ্লেট ব্যবস্থাপনা</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              মোট: {templates.length} টি
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            পোস্টার ডিজাইনের ক্যাটালগ ও টেমপ্লেটের সক্রিয় অবস্থা নিয়ন্ত্রণ করুন
          </p>
        </div>

        {/* Add Template Button (Emerald) */}
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>নতুন টেমপ্লেট যোগ করুন</span>
        </button>
      </div>

      {/* 2-Second Success Alert Message */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400/80 hover:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Responsive Templates Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      {templates.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">কোন টেমপ্লেট নেই</h3>
          <p className="text-sm text-slate-400 mb-6">
            নতুন একটি রাজনৈতিক পোস্টার টেমপ্লেট যোগ করতে উপরের বোতামে ক্লিক করুন।
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2 text-sm font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors"
          >
            প্রথম টেমপ্লেট যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 group"
            >
              <div>
                {/* Thumbnail Image — aspect-[3/4] object-cover rounded-xl w-full */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/60 shadow-inner mb-4">
                  <img
                    src={template.thumbnailUrl}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    {renderCategoryBadge(template.categoryType)}
                  </div>
                </div>

                {/* Title (Bangla text) */}
                <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-2 group-hover:text-emerald-400 transition-colors">
                  {template.title}
                </h3>
              </div>

              {/* Bottom Actions: isActive toggle + Delete button */}
              <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                {/* isActive toggle button */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(template._id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    template.isActive
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-800/80"
                  }`}
                  title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      template.isActive ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                  <span>{template.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                </button>

                {/* Delete button (red trash icon) */}
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(template._id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="টেমপ্লেট মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for New Template */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>নতুন টেমপ্লেট তৈরি</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  টেমপ্লেট শিরোনাম *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  placeholder="যেমন: মহান বিজয় দিবস ২০২৪"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  ক্যাটাগরি নির্বাচন করুন
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as TemplateCategory)
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                >
                  <option value="victoryDay">বিজয় দিবস (victoryDay)</option>
                  <option value="campaign">নির্বাচন (campaign)</option>
                  <option value="condolence">শোক (condolence)</option>
                  <option value="eid">ঈদ (eid)</option>
                  <option value="greetings">শুভেচ্ছা (greetings)</option>
                </select>
              </div>

              {/* Thumbnail URL Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  থাম্বনেইল ইমেজ URL
                </label>
                <input
                  type="text"
                  value={newThumbnailUrl}
                  onChange={(e) => setNewThumbnailUrl(e.target.value)}
                  placeholder="/templates/campaign.svg অথবা https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>

              {/* isActive Checkbox */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-200">
                    টেমপ্লেটটি সক্রিয় রাখুন
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddTemplate}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
