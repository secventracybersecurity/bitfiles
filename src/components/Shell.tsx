"use client";

import * as React from "react";
import { Folder, Wallet, Search, Plus } from "lucide-react";
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
  { id: "node", label: "Be a Node", icon: Wallet },
];

export function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] text-[#0F172A] selection:bg-blue-100 font-sans overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Desktop Toggle (Centered) */}
      <div className="hidden md:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-2xl border border-white/50 p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.04)] items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-8 py-2.5 rounded-full font-semibold transition-all relative text-sm tracking-tight",
              activeTab === tab.id 
                ? "text-white" 
                : "text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-[#3B82F6] rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-32 md:pb-0 md:pt-28 max-w-5xl mx-auto w-full px-6 md:px-12">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-24 items-start justify-around bg-white/80 backdrop-blur-3xl border-t border-black/[0.03] px-6 pt-3 pb-safe">
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
