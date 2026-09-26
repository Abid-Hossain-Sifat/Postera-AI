"use client";
import { useRef, useState } from "react";

interface PhotoPreview {
  file: File;
  preview: string;
}

interface PhotoUploadProps {
  maxPhotos?: number;
  onPhotosChange: (photos: File[]) => void;
  label?: string;
}

const PhotoUpload = ({ maxPhotos = 3, onPhotosChange, label }: PhotoUploadProps) => {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - photos.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    const updated = [...photos, ...toAdd];
    setPhotos(updated);
    onPhotosChange(updated.map((p) => p.file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photos[idx].preview);
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    onPhotosChange(updated.map((p) => p.file));
  };

  const photoLabels = ["প্রধান নেতা", "দ্বিতীয় নেতা", "তৃতীয় নেতা"];

  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        {label || `নেতার ছবি আপলোড করুন (সর্বোচ্চ ${maxPhotos}টি)`}
      </label>

      <div className="flex flex-wrap gap-3">
        {photos.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500/40 group shadow-lg shadow-emerald-500/10">
              <img
                src={p.preview}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <div className="w-8 h-8 bg-rose-500/20 border border-rose-500/40 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-black text-slate-950 shadow">
                {i + 1}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium text-center whitespace-nowrap">
              {photoLabels[i] || `ছবি ${i + 1}`}
            </span>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-all bg-slate-900/50 hover:bg-emerald-500/5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight px-1">
                ছবি যোগ করুন
              </span>
            </button>
            <span className="text-[10px] text-slate-600 font-medium text-center whitespace-nowrap">
              {photoLabels[photos.length] || `ছবি ${photos.length + 1}`}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <p className="mt-2.5 text-xs text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {photos.length}/{maxPhotos}টি ছবি নির্বাচিত
          {photos.length < maxPhotos && (
            <span className="text-slate-600">
              — আরও {maxPhotos - photos.length}টি যোগ করা যাবে
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;
