"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MoreHorizontal, 
  Search,
  Plus,
  Pause,
  Play,
  Wallet,
  Grid2X2,
  List as ListIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// --- Sub-components for Files Tab ---
const CategoryCard = ({ icon: Icon, label, count, color }: any) => (
  <button className="flex flex-col items-start bg-white p-5 rounded-[2rem] border border-black/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all text-left">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-lg text-[#0F172A] tracking-tight">{label}</h3>
    <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mt-1">{count} items</p>
  </button>
);

const FileRow = ({ name, size, date, icon: Icon }: any) => (
  <div className="flex items-center gap-4 py-4 active:bg-[#F8FAFC] transition-colors cursor-pointer group px-2 rounded-2xl">
    <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] group-active:bg-[#3B82F6] group-active:text-white transition-all">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0 border-b border-black/[0.03] pb-4 group-last:border-none group-last:pb-0">
      <h4 className="font-bold text-[#0F172A] truncate text-sm">{name}</h4>
      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{date} • {size}</p>
    </div>
    <button className="p-2 text-[#94A3B8]">
      <MoreHorizontal size={18} />
    </button>
  </div>
);

// --- Sub-components for Node Tab ---
const NodeView = () => {
  const [sharedStorage, setSharedStorage] = React.useState(250);
  const [status, setStatus] = React.useState<"active" | "paused">("active");
  
  const annualEarnings = sharedStorage * 24; 
  const monthlyEarnings = Math.floor(annualEarnings / 12);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-[0_24px_48px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden">
        {/* Subtle Status Light */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-amber-500")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{status}</span>
        </div>

        <div className="space-y-10">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Monthly Earnings</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-[#0F172A]">₹{monthlyEarnings}</span>
            </div>
            <p className="text-[#3B82F6] font-extrabold text-sm">₹{annualEarnings.toLocaleString()} per year</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Storage Shared</p>
                <p className="text-2xl font-black text-[#0F172A]">{sharedStorage} GB</p>
              </div>
              <Wallet className="w-8 h-8 text-[#3B82F6]" strokeWidth={2.5} />
            </div>
            
            <Slider 
              value={[sharedStorage]} 
              max={1000} 
              step={10} 
              onValueChange={(val) => setSharedStorage(val[0])}
              className="py-4 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setStatus(status === "active" ? "paused" : "active")}
              className={cn(
                "w-full py-4.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97]",
                status === "active"
                  ? "bg-[#0F172A] text-white"
                  : "bg-[#3B82F6] text-white"
              )}
            >
              {status === "active" ? (
                <>
                  <Pause size={18} fill="currentColor" />
                  <span>Pause Earning</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>Start Earning</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-12 text-[#64748B] text-center max-w-[280px] text-xs font-semibold leading-relaxed tracking-tight">
        Your sharing helps the network stay fast. <br/>Safe, private, and always under your control.
      </p>
    </div>
  );
};

export default function NativeApp() {
  const [activeTab, setActiveTab] = React.useState("files");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === "files" ? (
          <motion.div 
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between pt-4">
              <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">Files</h1>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-full hover:bg-white text-[#64748B] active:scale-95 transition-all">
                  <Search size={22} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CategoryCard icon={ImageIcon} label="Photos" count="1,284" color="bg-blue-50 text-blue-500" />
              <CategoryCard icon={FileText} label="Docs" count="432" color="bg-orange-50 text-orange-500" />
              <CategoryCard icon={Video} label="Videos" count="86" color="bg-purple-50 text-purple-500" />
              <CategoryCard icon={MoreHorizontal} label="Other" count="156" color="bg-emerald-50 text-emerald-500" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Recent</h2>
                <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm border border-black/[0.03] p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-[#3B82F6]" : "text-[#94A3B8]")}
                  >
                    <Grid2X2 size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-white shadow-sm text-[#3B82F6]" : "text-[#94A3B8]")}
                  >
                    <ListIcon size={16} />
                  </button>
                </div>
              </div>

              {viewMode === "list" ? (
                <div className="bg-white/40 rounded-[2.5rem] border border-white/50 p-4 divide-y divide-black/[0.02]">
                  <FileRow name="Family_Vacation_2024.jpg" size="12.8 MB" date="2h ago" icon={ImageIcon} />
                  <FileRow name="Monthly_Report_Final.pdf" size="4.2 MB" date="5h ago" icon={FileText} />
                  <FileRow name="House_Walkthrough.mp4" size="84.5 MB" date="Yesterday" icon={Video} />
                  <FileRow name="Tax_Returns_2023.pdf" size="1.1 MB" date="Dec 12" icon={FileText} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white rounded-[2rem] border border-black/[0.02] p-4 flex flex-col justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">
                        <ImageIcon size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#0F172A] truncate">File_{i}.jpg</p>
                        <p className="text-[10px] font-bold text-[#94A3B8]">4.2 MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Upload Button */}
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-32 right-8 w-16 h-16 bg-[#3B82F6] text-white rounded-full shadow-[0_16px_32px_rgba(59,130,246,0.3)] flex items-center justify-center z-40 md:hidden"
            >
              <Plus size={32} strokeWidth={3} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="node"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <NodeView />
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
