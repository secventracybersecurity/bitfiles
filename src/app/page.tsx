"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { motion } from "framer-motion";
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MoreHorizontal, 
  Search,
  Check,
  Pause,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// --- Sub-components for Files Tab ---
const FileCategory = ({ icon: Icon, label, count, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer group">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", bg)}>
      <Icon className={cn("w-7 h-7", color)} />
    </div>
    <h3 className="font-bold text-xl leading-tight mb-1 text-[#0F172A]">{label}</h3>
    <p className="text-[#64748B] text-sm font-medium">{count} files</p>
  </div>
);

const RecentFile = ({ name, size, date, icon: Icon }: any) => (
  <div className="flex items-center gap-5 p-4 hover:bg-[#F8FAFC] rounded-[1.5rem] transition-all cursor-pointer group">
    <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[#0F172A] truncate">{name}</h4>
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">{date} • {size}</p>
    </div>
    <button className="p-2 text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity">
      <MoreHorizontal size={20} />
    </button>
  </div>
);

// --- Sub-components for Node Tab ---
const NodeExperience = () => {
  const [sharedStorage, setSharedStorage] = React.useState(250);
  const [status, setStatus] = React.useState<"active" | "paused">("active");
  
  const annualEarnings = sharedStorage * 24; 
  const monthlyEarnings = Math.floor(annualEarnings / 12);
  
  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-8 right-8">
          <button 
            onClick={() => setStatus(status === "active" ? "paused" : "active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
              status === "active" 
                ? "bg-emerald-50 text-emerald-600" 
                : "bg-amber-50 text-amber-600"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
            {status}
          </button>
        </div>

        <div className="space-y-12">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-[0.2em]">Earning Potential</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-[#0F172A]">₹{monthlyEarnings}</span>
              <span className="text-xl font-bold text-[#64748B]">/month</span>
            </div>
            <p className="text-[#3B82F6] font-bold text-lg">₹{annualEarnings.toLocaleString()} estimated per year</p>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#64748B] uppercase tracking-widest">Sharing</p>
                <p className="text-3xl font-black text-[#0F172A]">{sharedStorage} GB</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#3B82F6]">
                <Cpu size={24} />
              </div>
            </div>
            
            <Slider 
              value={[sharedStorage]} 
              max={1000} 
              step={10} 
              onValueChange={(val) => setSharedStorage(val[0])}
              className="py-4 cursor-pointer"
            />
          </div>

          <div className="pt-4">
            <button 
              onClick={() => setStatus(status === "active" ? "paused" : "active")}
              className={cn(
                "w-full py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                status === "active"
                  ? "bg-[#0F172A] text-white hover:bg-black"
                  : "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              )}
            >
              {status === "active" ? (
                <>
                  <Pause size={20} fill="currentColor" />
                  <span>Pause Earning</span>
                </>
              ) : (
                <>
                  <Play size={20} fill="currentColor" />
                  <span>Start Earning</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-10 text-[#64748B] font-medium px-8 leading-relaxed">
        Your data remains 100% private. Sharing storage only uses your spare capacity. No setup required.
      </p>
    </div>
  );
};

// --- Main Page Component ---
export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState("files");

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "files" && (
        <div className="max-w-5xl mx-auto space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight text-[#0F172A]">My Library</h2>
              <div className="flex items-center gap-4">
                <button className="p-3 rounded-full hover:bg-white transition-colors text-[#64748B]">
                  <Search size={24} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FileCategory icon={ImageIcon} label="Photos" count="1,284" color="text-[#3B82F6]" bg="bg-blue-50" />
              <FileCategory icon={FileText} label="Documents" count="432" color="text-orange-500" bg="bg-orange-50" />
              <FileCategory icon={Video} label="Videos" count="86" color="text-purple-500" bg="bg-purple-50" />
              <FileCategory icon={MoreHorizontal} label="Other" count="156" color="text-emerald-500" bg="bg-emerald-50" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Recently Added</h2>
              <button className="text-[#3B82F6] text-sm font-bold hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/50 p-4 space-y-1">
              <RecentFile name="Family_Vacation_2024.jpg" size="12.8 MB" date="2h ago" icon={ImageIcon} />
              <RecentFile name="Monthly_Report_Final.pdf" size="4.2 MB" date="5h ago" icon={FileText} />
              <RecentFile name="House_Walkthrough.mp4" size="84.5 MB" date="Yesterday" icon={Video} />
              <RecentFile name="Tax_Returns_2023.pdf" size="1.1 MB" date="Dec 12" icon={FileText} />
            </div>
          </section>
        </div>
      )}

      {activeTab === "node" && <NodeExperience />}
    </Shell>
  );
}
