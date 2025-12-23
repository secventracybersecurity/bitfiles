"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { motion } from "framer-motion";
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MoreHorizontal, 
  ChevronRight,
  HardDrive,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  Grid2X2,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// --- Sub-components for Files Tab ---
const FileCategory = ({ icon: Icon, label, count, color, bg }: any) => (
  <div className="bg-card p-5 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", bg)}>
      <Icon className={cn("w-6 h-6", color)} />
    </div>
    <h3 className="font-semibold text-lg leading-tight">{label}</h3>
    <p className="text-muted-foreground text-sm">{count} files</p>
  </div>
);

const RecentFile = ({ name, size, date, icon: Icon }: any) => (
  <div className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-2xl transition-colors cursor-pointer group">
    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-white transition-colors">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{name}</h4>
      <p className="text-xs text-muted-foreground">{date} • {size}</p>
    </div>
    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <MoreHorizontal size={18} className="text-muted-foreground" />
    </button>
  </div>
);

// --- Sub-components for Node Tab ---
const NodeEarningsCard = ({ sharedStorage }: { sharedStorage: number }) => {
  const annualEarnings = sharedStorage * 24; // Example: ₹24 per GB per year
  const monthlyEarnings = annualEarnings / 12;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Monthly Estimate</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">₹{monthlyEarnings.toLocaleString()}</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
        </div>
        <div className="bg-accent/30 rounded-[2rem] p-8 border border-accent">
          <p className="text-sm font-semibold text-accent-foreground uppercase tracking-wider mb-2">Yearly Projection</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">₹{annualEarnings.toLocaleString()}</span>
            <span className="text-muted-foreground">/yr</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Storage to share</h3>
          <span className="text-2xl font-bold text-primary">{sharedStorage} GB</span>
        </div>
        
        <Slider 
          defaultValue={[sharedStorage]} 
          max={1000} 
          step={10} 
          onValueChange={(val) => window.dispatchEvent(new CustomEvent('storage-change', { detail: val[0] }))}
          className="py-4"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-widest">
          <span>0 GB</span>
          <span>500 GB</span>
          <span>1 TB</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <span className="text-sm font-medium">Encrypted</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <span className="text-sm font-medium">Passive Income</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <HardDrive size={18} />
          </div>
          <span className="text-sm font-medium">Simple Setup</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Dashboard() {
  const [activeTab, setActiveTab] = React.useState("files");
  const [sharedStorage, setSharedStorage] = React.useState(100);

  React.useEffect(() => {
    const handleStorageChange = (e: any) => setSharedStorage(e.detail);
    window.addEventListener('storage-change', handleStorageChange);
    return () => window.removeEventListener('storage-change', handleStorageChange);
  }, []);

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "files" && (
        <div className="max-w-5xl mx-auto space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
              <button className="text-primary text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <FileCategory icon={ImageIcon} label="Photos" count="1,284" color="text-blue-500" bg="bg-blue-50" />
              <FileCategory icon={FileText} label="Docs" count="432" color="text-orange-500" bg="bg-orange-50" />
              <FileCategory icon={Video} label="Videos" count="86" color="text-purple-500" bg="bg-purple-50" />
              <FileCategory icon={MoreHorizontal} label="Others" count="156" color="text-emerald-500" bg="bg-emerald-50" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Recent Files</h2>
              <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-full">
                <button className="p-1.5 rounded-full bg-white shadow-sm"><Grid2X2 size={16} /></button>
                <button className="p-1.5 rounded-full text-muted-foreground"><List size={16} /></button>
              </div>
            </div>
            <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden divide-y divide-border/30">
              <RecentFile name="Design_Specs_v2.pdf" size="4.2 MB" date="2h ago" icon={FileText} />
              <RecentFile name="Vacation_Hero.jpg" size="12.8 MB" date="5h ago" icon={ImageIcon} />
              <RecentFile name="Quarterly_Report.xlsx" size="1.1 MB" date="Yesterday" icon={FileText} />
              <RecentFile name="App_Launch_Video.mp4" size="84.5 MB" date="Dec 12" icon={Video} />
            </div>
          </section>
        </div>
      )}

      {activeTab === "node" && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Be a part of Storzy</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Earn money by sharing your unused computer storage. It's safe, private, and helps build a better internet.
            </p>
          </div>
          <NodeEarningsCard sharedStorage={sharedStorage} />
        </div>
      )}

      {activeTab === "account" && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary to-blue-400 p-1">
              <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Alex Johnson</h2>
              <p className="text-muted-foreground">alex@example.com</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-[2rem] border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HardDrive size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage Used</p>
                <p className="text-xl font-bold">128.4 GB <span className="text-sm font-normal text-muted-foreground">/ 2 TB</span></p>
              </div>
            </div>
            <div className="bg-card p-6 rounded-[2rem] border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-xl font-bold">₹8,450.00</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[2rem] border shadow-sm overflow-hidden">
            {[
              { label: "Subscription Plan", icon: CreditCard, detail: "Premium 2TB" },
              { label: "Security & Privacy", icon: ShieldCheck, detail: "Active" },
              { label: "Help & Support", icon: HelpCircle, detail: "" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors border-b last:border-b-0 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>{item.detail}</span>
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>

          <button className="w-full py-4 text-red-500 font-semibold hover:bg-red-50 rounded-[2rem] transition-colors">
            Log Out
          </button>
        </div>
      )}
    </Shell>
  );
}
