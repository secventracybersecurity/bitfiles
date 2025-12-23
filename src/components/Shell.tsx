"use client";

import * as React from "react";
import { Folder, Cpu, User, Search, Plus, List, Grid2X2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: "files", label: "Files", icon: Folder },
  { id: "node", label: "Be a Node", icon: Cpu },
];

export function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] text-[#0F172A] selection:bg-blue-100">
      <AnimatedBackground />
      
      {/* Desktop Toggle (Centered) */}
      <div className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-white p-1.5 rounded-full shadow-lg shadow-black/5 items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-all relative text-sm",
              activeTab === tab.id 
                ? "text-white" 
                : "text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-[#3B82F6] rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 md:pt-24 max-w-7xl mx-auto w-full">
        <header className="md:hidden sticky top-0 z-30 flex h-20 items-center justify-between px-6 bg-[#FAFAFA]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">STORZY</span>
          </div>
          <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all active:scale-95 text-sm">
            <Plus size={18} />
            <span>Upload</span>
          </button>
        </header>

        <div className="p-6 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex h-16 items-center justify-around bg-white/90 px-4 rounded-[2rem] shadow-xl shadow-black/5 backdrop-blur-xl border border-white/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 px-8 py-2 rounded-2xl",
              activeTab === tab.id ? "text-[#3B82F6]" : "text-[#64748B]"
            )}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
