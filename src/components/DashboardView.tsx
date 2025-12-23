"use client";

import * as React from "react";
import { ArrowLeft, FileText, HardDrive, BarChart3 } from "lucide-react";

interface DashboardViewProps {
  profile: any;
  onBack: () => void;
}

export const DashboardView = ({ profile, onBack }: DashboardViewProps) => (
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
          <h3 className="text-4xl font-black text-[#0F172A]">
            {(profile?.photo_count || 0) + (profile?.doc_count || 0) + (profile?.video_count || 0)}
          </h3>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
          <HardDrive size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Storage Usage</p>
          <h3 className="text-4xl font-black text-[#0F172A]">
            {profile ? Math.round((profile.storage_used / profile.storage_limit) * 100) : 0}%
          </h3>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
          <BarChart3 size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Earnings</p>
          <h3 className="text-4xl font-black text-[#0F172A]">₹{profile?.total_earnings?.toFixed(0) || 0}</h3>
        </div>
      </div>
    </div>
  </div>
);
