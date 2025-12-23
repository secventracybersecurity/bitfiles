"use client";

import * as React from "react";
import { Folder, Wallet, Search, Plus, Menu, User, LogOut, Settings, LayoutDashboard, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDashboardClick?: () => void;
}

const tabs = [
  { id: "files", label: "Files", icon: Folder },
  { id: "node", label: "Earn", icon: Wallet },
];

export function Shell({ children, activeTab, setActiveTab, onDashboardClick }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
      } else {
        getSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setProfileOpen(false);
  };

  const storageUsedGB = profile?.storage_used ? (Number(profile.storage_used) / (1024 * 1024 * 1024)).toFixed(1) : "0.0";
  const storageLimitGB = profile?.storage_limit ? (Number(profile.storage_limit) / (1024 * 1024 * 1024)).toFixed(0) : "10";
  const storagePercent = profile ? (Number(profile.storage_used) / Number(profile.storage_limit)) * 100 : 0;

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] text-[#0F172A] selection:bg-blue-100 font-sans overflow-x-hidden">
      <AnimatedBackground />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] z-[60] px-4 flex items-center justify-between">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-black/[0.03] rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="font-black tracking-tighter text-xl">STORZY</h1>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-black/[0.05]"
          >
            {user ? (
              <User className="text-blue-600" size={20} />
            ) : (
              <Lock className="text-[#64748B]" size={18} />
            )}
          </button>

          <AnimatePresence>
            {profileOpen && user && (
              <>
                <div 
                  className="fixed inset-0 z-[61]" 
                  onClick={() => setProfileOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-black/[0.05] z-[62] py-2 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      onDashboardClick?.();
                      setProfileOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-black/[0.03] transition-colors"
                  >
                    <LayoutDashboard size={18} className="text-[#64748B]" />
                    <span className="text-sm font-semibold">Dashboard</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-black/[0.03] transition-colors">
                    <Settings size={18} className="text-[#64748B]" />
                    <span className="text-sm font-semibold">Account</span>
                  </button>
                  <div className="h-px bg-black/[0.05] my-1 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-semibold">Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[71] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-xl tracking-tighter">STORZY</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-black/[0.03] rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] mb-4">Library</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-[#64748B]">Photos</span>
                      <span>{profile?.photo_count ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-[#64748B]">Documents</span>
                      <span>{profile?.doc_count ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-[#64748B]">Videos</span>
                      <span>{profile?.video_count ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-black/[0.05]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] mb-4">Storage</h3>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[#64748B]">{storageUsedGB} GB of {storageLimitGB} GB used</span>
                    </div>
                  </div>
                </div>

                {/* Role indicator for admins */}
                {profile?.role && profile.role !== 'USER' && (
                  <div className="pt-6 border-t border-black/[0.05]">
                    <div className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                      {profile.role} ACCESS
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 pb-32 md:pb-0 pt-20 md:pt-24 max-w-5xl mx-auto w-full px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-20 items-start justify-around bg-white/80 backdrop-blur-3xl border-t border-black/[0.03] px-6 pt-3 pb-safe">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-150 px-6 py-2 rounded-2xl",
              activeTab === tab.id ? "text-[#3B82F6]" : "text-[#94A3B8]"
            )}
          >
            <tab.icon 
              size={24} 
              strokeWidth={activeTab === tab.id ? 2.5 : 2} 
              className={cn("transition-transform", activeTab === tab.id && "scale-110")}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
