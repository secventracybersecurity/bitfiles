"use client";

import * as React from "react";
import { ArrowLeft, Wallet, TrendingUp, ShieldCheck, Activity, Loader2 } from "lucide-react";

interface EarnViewProps {
  onBack: () => void;
}

export const EarnView = ({ onBack }: EarnViewProps) => {
  const [metrics, setMetrics] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/ai/nodes/status');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch node metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalToday = metrics.reduce((acc, m) => acc + (m.earnings_today || 0), 0);
  const totalBalance = metrics.reduce((acc, m) => acc + (m.earnings_total || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-black/[0.03] rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Earning Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Earnings</p>
            <h3 className="text-6xl font-black tracking-tighter">₹{totalBalance.toFixed(2)}</h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold">
              <TrendingUp size={16} />
              <span>+₹{totalToday.toFixed(2)} today</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-black text-[#0F172A]">Network Reputation</h4>
              <p className="text-sm text-[#64748B]">Node reliability score: 98.4%</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '98.4%' }} />
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-[#0F172A]">Active Nodes</h3>
          {loading && <Loader2 className="animate-spin text-blue-500" size={20} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((node) => (
            <div key={node.node_id} className="p-6 rounded-[2rem] border border-black/[0.03] hover:border-blue-100 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <Activity size={20} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  node.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {node.status}
                </div>
              </div>
              <h4 className="font-black text-[#0F172A] text-lg mb-1">{node.node_id}</h4>
              <p className="text-xs text-[#64748B] font-bold uppercase tracking-widest mb-6">Health Score: {(node.health_score * 100).toFixed(0)}%</p>
              
              <div className="pt-6 border-t border-black/[0.03] flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">Total Earned</p>
                  <p className="font-black text-[#0F172A]">₹{node.earnings_total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">24h</p>
                  <p className="font-black text-emerald-500">+₹{node.earnings_today.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
