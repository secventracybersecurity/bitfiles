"use client";

import * as React from "react";
import { Plus, Loader2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

interface EarnViewProps {
  user: any;
  profile: any;
}

export const EarnView = ({ user, profile }: EarnViewProps) => {
  const [nodes, setNodes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();
  
  const fetchNodes = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('nodes')
      .select('*')
      .eq('provider_id', user.id);
    setNodes(data || []);
    setLoading(false);
  }, [user, supabase]);

  React.useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const toggleNode = async (node: any) => {
    const newStatus = node.status === 'active' ? 'inactive' : 'active';
    await supabase
      .from('nodes')
      .update({ status: newStatus })
      .eq('id', node.id);
    fetchNodes();
  };

  const registerNode = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('nodes')
      .insert({
        provider_id: user.id,
        name: `Node-${Math.random().toString(36).substring(7).toUpperCase()}`,
        status: 'active',
        capacity_gb: 100,
        used_gb: 0,
        uptime_score: 1.0,
        region: 'Global/Any'
      })
      .select()
      .single();
    
    if (error) alert(error.message);
    else fetchNodes();
  };
  
  const dimensions = [
    { label: "Storage (S)", value: 0.85, weight: 0.25, color: "bg-blue-500" },
    { label: "Uptime (U)", value: 0.98, weight: 0.25, color: "bg-emerald-500" },
    { label: "Reliability (R)", value: 0.92, weight: 0.20, color: "bg-purple-500" },
    { label: "Trust (T)", value: 1.0, weight: 0.20, color: "bg-amber-500" },
    { label: "Diversity (D)", value: 0.45, weight: 0.07, color: "bg-rose-500" },
    { label: "Latency (L)", value: 0.78, weight: 0.03, color: "bg-slate-500" },
  ];

  const ncs = dimensions.reduce((acc, d) => acc * Math.pow(d.value, d.weight), 1);
  const activeNodesCount = nodes.filter(n => n.status === 'active').length;
  
  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">Constitutional Earnings</h1>
          <p className="text-[#64748B] font-bold mt-1 uppercase tracking-widest text-[10px]">Incentive Engine • PIFM++ Protocol</p>
        </div>
        
        <button 
          onClick={registerNode}
          className="px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl active:scale-95 hover:bg-slate-800"
        >
          <Plus size={18} />
          REGISTER NEW NODE
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-[#64748B] uppercase tracking-[0.2em] px-2">Your Managed Nodes ({nodes.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
          ) : nodes.length > 0 ? (
            nodes.map(node => (
              <div key={node.id} className="bg-white p-6 rounded-[2rem] border border-black/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", node.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    <span className="font-black text-sm tracking-tight text-[#0F172A]">{node.name}</span>
                  </div>
                  <button 
                    onClick={() => toggleNode(node)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      node.status === 'active' ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                    )}
                  >
                    {node.status === 'active' ? "Deactivate" : "Activate"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">Capacity</p>
                    <p className="text-lg font-black text-[#0F172A]">{node.capacity_gb}GB</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">Used</p>
                    <p className="text-lg font-black text-[#0F172A]">{node.used_gb}GB</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(node.used_gb / node.capacity_gb) * 100}%` }} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white/50 rounded-[2rem] border border-dashed border-black/10">
              <p className="text-sm font-bold text-[#64748B]">No active nodes found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Real-time Yield</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * activeNodesCount).toFixed(2)}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Monthly Projection</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * 30 * activeNodesCount).toFixed(0)}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Yearly Projection</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * 365 * activeNodesCount).toFixed(0)}</h3>
        </div>
      </div>
    </div>
  );
};
