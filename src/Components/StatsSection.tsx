import { Image as ImageIcon, Printer, Zap, PenTool } from "lucide-react";

const stats = [
  { value: "৫,০০০+", label: "পোস্টার তৈরি হয়েছে", icon: ImageIcon },
  { value: "৩০০ DPI", label: "প্রিন্ট-রেডি কোয়ালিটি", icon: Printer },
  { value: "১ মিনিট", label: "গড় তৈরির সময়", icon: Zap },
  { value: "১০০%", label: "নিখুঁত বাংলা যুক্তবর্ণ", icon: PenTool },
];

const StatsSection = () => (
  <section className="py-12 md:py-16 bg-slate-950 border-y border-slate-900">
    <div className="w-[95%] lg:max-w-[80%] mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((s, i) => {
          const IconComp = s.icon;
          return (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-2">
                <IconComp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs md:text-sm text-slate-500 font-medium">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default StatsSection;
