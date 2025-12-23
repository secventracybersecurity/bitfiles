"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { Auth } from "@/components/Auth";
import { FileBrowser } from "@/components/FileBrowser";
import { EarnView } from "@/components/EarnView";
import { DashboardView } from "@/components/DashboardView";
import { useAppState } from "@/lib/hooks/use-app-state";
import { Loader2, Lock, ShieldCheck, Key } from "lucide-react";
import { deriveMasterKey } from "@/lib/crypto";
import { motion, AnimatePresence } from "framer-motion";

export default function RootPage() {
  const { user, profile, loading, vaultKey, setVaultKey } = useAppState() as any;
  const [activeTab, setActiveTab] = React.useState("files");
  const [view, setView] = React.useState<"app" | "dashboard">("app");
  const [vaultPassword, setVaultPassword] = React.useState("");
  const [isUnlocking, setIsUnlocking] = React.useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPassword) return;
    setIsUnlocking(true);
    try {
      // Use a fixed salt for the demo, or derive from user ID
      const salt = new TextEncoder().encode(user.id);
      const key = await deriveMasterKey(vaultPassword, salt);
      setVaultKey(key);
    } catch (err) {
      alert("Failed to unlock vault");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!vaultKey) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-black/[0.02] text-center space-y-8"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-600">
            <Lock size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter">Unlock Your Vault</h1>
            <p className="text-[#64748B] font-medium">Your data is sharded and encrypted. Enter your master secret to access.</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="password" 
                value={vaultPassword}
                onChange={(e) => setVaultPassword(e.target.value)}
                placeholder="Master Secret Key"
                className="w-full bg-slate-50 border border-black/[0.03] rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button 
              disabled={isUnlocking}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isUnlocking ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
              {isUnlocking ? "Deriving Keys..." : "Access Sharded Data"}
            </button>
          </form>
          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Zero-Knowledge Storage: We never see your password</p>
        </motion.div>
      </div>
    );
  }

  return (
    <Shell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onDashboardClick={() => setView("dashboard")}
      user={user}
      profile={profile}
    >
      {view === "dashboard" ? (
        <DashboardView profile={profile} onBack={() => setView("app")} />
      ) : activeTab === "files" ? (
        <FileBrowser user={user} profile={profile} />
      ) : (
        <EarnView user={user} profile={profile} />
      )}
    </Shell>
  );
}
