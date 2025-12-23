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
  ArrowUpDown,
  Filter,
  ArrowLeft,
  HardDrive,
  BarChart3,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

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

// --- Dashboard View ---
const DashboardView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-black/[0.03] rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Total Files</p>
            <h3 className="text-4xl font-black text-[#0F172A]">1,802</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Storage Usage</p>
            <h3 className="text-4xl font-black text-[#0F172A]">65%</h3>
            <p className="text-xs font-bold text-[#64748B] mt-1">12.4 GB of 20 GB used</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Earnings Summary</p>
            <h3 className="text-4xl font-black text-[#0F172A]">₹2,450</h3>
            <p className="text-xs font-bold text-[#64748B] mt-1">Expected this month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NativeApp() {
  const [activeTab, setActiveTab] = React.useState("files");
  const [view, setView] = React.useState<"app" | "dashboard">("app");

  if (view === "dashboard") {
    return (
      <Shell activeTab={activeTab} setActiveTab={setActiveTab} onDashboardClick={() => setView("dashboard")}>
        <DashboardView onBack={() => setView("app")} />
      </Shell>
    );
  }

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab} onDashboardClick={() => setView("dashboard")}>
      <AnimatePresence mode="wait">
        {activeTab === "files" ? (
          <motion.div 
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 pb-12"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="text" 
                placeholder="Search files, folders..."
                className="w-full bg-white border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[2rem] py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CategoryCard icon={ImageIcon} label="Photos" count="1,284" color="bg-blue-50 text-blue-500" />
              <CategoryCard icon={FileText} label="Docs" count="432" color="bg-orange-50 text-orange-500" />
              <CategoryCard icon={Video} label="Videos" count="86" color="bg-purple-50 text-purple-500" />
              <CategoryCard icon={MoreHorizontal} label="Other" count="156" color="bg-emerald-50 text-emerald-500" />
            </div>

            {/* Files List Header */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Recent Files</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-black/[0.03] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors shadow-sm">
                    <ArrowUpDown size={14} />
                    <span>Sort</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-black/[0.03] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors shadow-sm">
                    <Filter size={14} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Files List */}
              <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-6 divide-y divide-black/[0.03]">
                <FileRow name="Family_Vacation_2024.jpg" size="12.8 MB" date="2h ago" icon={ImageIcon} />
                <FileRow name="Monthly_Report_Final.pdf" size="4.2 MB" date="5h ago" icon={FileText} />
                <FileRow name="House_Walkthrough.mp4" size="84.5 MB" date="Yesterday" icon={Video} />
                <FileRow name="Tax_Returns_2023.pdf" size="1.1 MB" date="Dec 12" icon={FileText} />
                <FileRow name="Travel_Itinerary.docx" size="856 KB" date="Dec 10" icon={FileText} />
              </div>
            </div>

            {/* Floating Upload Button */}
            <motion.button 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-28 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_16px_32px_rgba(59,130,246,0.3)] flex items-center justify-center z-40"
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
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
          >
             <div className="bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center max-w-sm w-full space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Wallet size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-[#0F172A]">Start Earning</h2>
                  <p className="text-sm font-medium text-[#64748B] leading-relaxed">
                    Share your unused storage space and get rewarded. Simple, secure, and automatic.
                  </p>
                </div>
                <button className="w-full py-5 bg-[#0F172A] text-white rounded-[2rem] font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10">
                  Enable Node Mode
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
