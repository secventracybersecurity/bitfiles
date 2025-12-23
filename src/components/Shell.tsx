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
  { id: "account", label: "Account", icon: User },
];

export function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/10">
      <AnimatedBackground />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight">STORZY</span>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon size={20} className={cn("transition-transform", activeTab === tab.id ? "scale-110" : "group-hover:scale-110")} />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="p-4 rounded-3xl bg-accent/50 border border-accent">
            <p className="text-xs font-semibold text-accent-foreground mb-1 uppercase tracking-wider">Storage Tip</p>
            <p className="text-sm text-secondary-foreground leading-snug">
              Sharing 50GB extra could pay for your Spotify this month.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl">
          <h1 className="text-lg font-semibold capitalize">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <Search size={20} />
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
              <Plus size={18} />
              <span className="hidden sm:inline text-sm">Upload</span>
            </button>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-card/80 px-4 pb-4 backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              activeTab === tab.id ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
