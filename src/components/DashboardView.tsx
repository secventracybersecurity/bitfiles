"use client";

import * as React from "react";
import { ArrowLeft, FileText, HardDrive, BarChart3, Loader2 } from "lucide-react";

interface DashboardViewProps {
  profile: any;
  onBack: () => void;
}

export const DashboardView = ({ profile, onBack }: DashboardViewProps) => {
  const [nodes, setNodes] = React.useState<any[]>([]);
  const [networkStats, setNetworkStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [nRes, sRes] = await Promise.all([
        fetch('/api/ai/nodes/status'),
        fetch('/api/ai/network/health')
      ]);
      const [nData, sData] = await Promise.all([nRes.json(), sRes.json()]);
      setNodes(nData);
      setNetworkStats(sData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleNode = async (nodeId: string, currentStatus: string) => {
    setToggling(nodeId);
    try {
      // Simulation of node control via API
      await new Promise(r => setTimeout(r, 600));
      setNodes(prev => prev.map(n => 
        n.node_id === nodeId ? { ...n, status: currentStatus === 'online' ? 'offline' : 'online' } : n
      ));
    } finally {
      setToggling(null);
    }
  };

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
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Network Health</p>
            <h3 className="text-4xl font-black text-[#0F172A]">
              {networkStats ? (networkStats.network_health_score * 100).toFixed(1) : "0"}%
            </h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Active Nodes</p>
            <h3 className="text-4xl font-black text-[#0F172A]">
              {networkStats?.active_nodes || 0} / {networkStats?.total_nodes || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Total Earnings</p>
            <h3 className="text-4xl font-black text-[#0F172A]">₹{nodes.reduce((acc, n) => acc + (n.earnings_total || 0), 0).toFixed(0)}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-[#0F172A]">Node Control Center</h3>
            <p className="text-sm text-[#64748B]">AI-managed decentralized node availability</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${networkStats?.active_nodes > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${networkStats?.active_nodes > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {networkStats?.active_nodes > 0 ? 'Network Active' : 'Network Critical'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {nodes.map((node: any) => (
            <div 
              key={node.node_id} 
              className={`p-4 rounded-3xl border transition-all duration-300 ${
                node.status === 'online' 
                  ? 'bg-emerald-50/50 border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' 
                  : 'bg-slate-50 border-slate-200 grayscale opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  node.status === 'online' ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {node.node_id}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  node.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                }`} />
              </div>
              
              <button
                onClick={() => toggleNode(node.node_id, node.status)}
                disabled={toggling === node.node_id}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  node.status === 'online'
                    ? 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                } disabled:opacity-50 flex items-center justify-center`}
              >
                {toggling === node.node_id ? <Loader2 className="animate-spin" size={12} /> : node.status === 'online' ? 'Stop Node' : 'Start Node'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
