"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Settings2, 
  Users, 
  History, 
  Power, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  BrainCircuit,
  Lock,
  ChevronRight,
  Eye,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
      active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-[#64748B] hover:bg-black/[0.03] hover:text-[#0F172A]"
    )}
  >
    <Icon size={20} />
    {label}
  </button>
);

export default function RootDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [loading, setLoading] = React.useState(true);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setAuditLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-black/[0.03] bg-white p-8 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Founder Root</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Secure Governance</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={Activity} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarItem icon={BrainCircuit} label="AI Brain Insights" active={activeTab === "ai"} onClick={() => router.push('/ai-admin')} />
          <SidebarItem icon={Users} label="User Management" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <SidebarItem icon={History} label="Audit Logs" active={activeTab === "audit"} onClick={() => setActiveTab("audit")} />
          <SidebarItem icon={Settings2} label="Network Config" active={activeTab === "config"} onClick={() => setActiveTab("config")} />
        </nav>

        <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Emergency Actions</p>
          <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
            <Power size={18} />
            Halt Network
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">Governance Overview</h1>
            <p className="text-[#64748B] font-bold text-sm mt-1">Founders are advisors to the math, not the users.</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white border border-black/[0.05] rounded-2xl font-bold text-sm text-[#64748B] hover:text-[#0F172A] transition-all"
          >
            Exit Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Pending Recommendations */}
          <div className="bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#0F172A]">AI Governance Actions</h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">3 Pending</div>
            </div>

            <div className="space-y-4">
              {[
                { title: "Increase US-East Incentive", desc: "Regional capacity critical", type: "economic" },
                { title: "Shard Re-balancing", desc: "Optimization of data distribution", type: "technical" },
                { title: "Update Staking Floor", desc: "Enhance sybil resistance", type: "security" }
              ].map((rec, i) => (
                <div key={i} className="p-6 bg-[#F8FAFC] rounded-[2rem] border border-black/[0.02] space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-[#0F172A]">{rec.title}</p>
                      <p className="text-xs text-[#64748B] font-medium">{rec.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 border border-black/[0.03] rounded-xl transition-all shadow-sm">
                        <CheckCircle2 size={18} />
                      </button>
                      <button className="p-3 bg-white hover:bg-red-50 text-red-600 border border-black/[0.03] rounded-xl transition-all shadow-sm">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-5 bg-[#0F172A] text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 group">
              View All Recommendations
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#0F172A]">Recent Audit Trail</h3>
              <History className="text-[#64748B]" size={24} />
            </div>

            <div className="flex-1 space-y-6">
              {auditLogs.map((log, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-[#64748B] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                    <Eye size={18} />
                  </div>
                  <div className="flex-1 border-b border-black/[0.03] pb-4 group-last:border-none">
                    <p className="font-bold text-sm text-[#0F172A]">{log.event_type.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-black/10" />
                      <span className="text-[10px] font-bold text-[#94A3B8]">
                        ID: {log.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-black/10 mt-2" />
                </div>
              ))}
            </div>

            <button className="w-full py-5 border border-black/[0.05] text-[#0F172A] rounded-[2rem] font-bold hover:bg-black/[0.02] transition-colors">
              Full Audit History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
