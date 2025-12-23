"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle,
  ChevronRight,
  BrainCircuit,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, status }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
    <div className="flex justify-between items-start">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        status === 'danger' ? 'bg-red-50 text-red-500' : 
        status === 'warning' ? 'bg-amber-50 text-amber-500' : 
        'bg-blue-50 text-blue-500'
      )}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={cn(
          "text-[10px] font-black px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{title}</p>
      <h3 className="text-3xl font-black text-[#0F172A] mt-1">{value}</h3>
      <p className="text-xs font-bold text-[#64748B] mt-1">{subtitle}</p>
    </div>
  </div>
);

export default function AIAdminPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      // Simulate AI Brain analysis
      await new Promise(r => setTimeout(r, 1500));
      setStats({
        nodes: { total: 1284, active: 1142, offline: 142 },
        storage: { total: "4.2 PB", used: "1.8 PB", available: "2.4 PB" },
        health: { score: 94, margin: "14%", anomalies: 2 },
        earnings: { pool: "₹4.2M", projected: "₹120K", sustainability: 0.88 }
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <BrainCircuit className="animate-spin text-blue-600 relative" size={64} strokeWidth={1.5} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-[#0F172A]">AI Brain Initializing</h2>
          <p className="text-sm font-bold text-[#64748B] uppercase tracking-[0.2em]">Analyzing Network Governance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BrainCircuit size={18} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A]">AI Governance Dashboard</h1>
          </div>
          <p className="text-[#64748B] font-bold text-sm ml-11 uppercase tracking-widest">Invisible System Advisor • Active</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white border border-black/[0.05] rounded-2xl font-bold text-sm text-[#64748B] hover:text-[#0F172A] transition-all shadow-sm flex items-center gap-2"
        >
          <Lock size={16} />
          Exit Secure View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Nodes" 
          value={stats.nodes.active} 
          subtitle={`${stats.nodes.offline} nodes currently offline`}
          icon={Server}
          trend={12}
        />
        <MetricCard 
          title="Network Storage" 
          value={stats.storage.total} 
          subtitle={`${stats.storage.used} utilized by network`}
          icon={Database}
          trend={8}
        />
        <MetricCard 
          title="Reliability Score" 
          value={`${stats.health.score}%`} 
          subtitle="Redundancy margin at 14%"
          icon={Activity}
          status={stats.health.score < 90 ? 'warning' : 'success'}
        />
        <MetricCard 
          title="Pool Balance" 
          value={stats.earnings.pool} 
          subtitle="Sustainability Index: 0.88"
          icon={TrendingUp}
          trend={4.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health & Risk */}
        <div className="bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-[#0F172A]">Health & Risk Signals</h3>
            <ShieldAlert className="text-blue-600" size={24} />
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="text-amber-600" size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#92400E]">Regional Congestion Detected</p>
                <p className="text-xs text-[#92400E]/70 font-medium">Nodes in US-East are approaching 90% storage capacity. Recommendation: Increase incentive weight for new nodes in this region.</p>
              </div>
            </div>

            <div className="p-5 bg-red-50 rounded-[2rem] border border-red-100 flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#991B1B]">Anomaly: High Churn Rate</p>
                <p className="text-xs text-[#991B1B]/70 font-medium">12 nodes disconnected simultaneously. Possible local ISP outage or sybil attack attempt. Monitoring closely.</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] space-y-8 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black">AI Recommendations</h3>
            <Zap className="text-blue-400" size={24} />
          </div>
          
          <div className="space-y-4">
            {[
              { label: "Optimize Reward Distribution", impact: "High", color: "text-blue-400" },
              { label: "Re-balance Storage Shards", impact: "Medium", color: "text-emerald-400" },
              { label: "Increase Minimum Staking", impact: "Low", color: "text-purple-400" }
            ].map((rec, i) => (
              <button key={i} className="w-full p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 transition-all text-left group flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-lg">{rec.label}</p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", rec.color)}>Impact: {rec.impact}</p>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-white transition-colors" size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
