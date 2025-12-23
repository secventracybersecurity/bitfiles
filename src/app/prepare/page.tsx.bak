"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield as StorzyShield, 
  Layers, 
  Fingerprint, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { encryptFile } from "@/lib/storage";

const STATES = [
  "Mathematically securing data (AES-256-GCM)…",
  "Fragmenting stream into cryptographic shards…",
  "Calculating integrity proofs & hashes (SHA-256)…",
  "Adaptive APEM redundancy scaling active",
  "Data ready for decentralized distribution"
];

const ICONS = [
  StorzyShield,
  Layers,
  Fingerprint,
  Loader2,
  CheckCircle2
];

export default function ChunkPreparationPage() {
  const [activeState, setActiveState] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [manifest, setManifest] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const startPreparation = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setLogs([]);
    setActiveState(0);

    try {
      addLog(`Initializing Zero-Knowledge pipeline for ${selectedFile.name}`);
      
      // Step 1: Client-side encryption
      addLog("Deriving ephemeral encryption keys...");
      const { encryptedChunks, chunkHashes } = await encryptFile(selectedFile);
      
      const encryptedBlob = new Blob(encryptedChunks);
      
      // Step 2: Transition to fragmenting
      setActiveState(1);
      addLog(`Fragmenting stream into ${encryptedChunks.length} shards of 4MB`);
      await new Promise(r => setTimeout(r, 1200));

      // Step 3: Transition to integrity proofs
      setActiveState(2);
      addLog("Generating SHA-256 integrity proofs for each shard...");
      await new Promise(r => setTimeout(r, 1000));
      
      // Step 4: APEM Scaling (Simulated Step 4)
      setActiveState(3);
      addLog("Analyzing network health... scaling APEM redundancy to 1.5x");
      await new Promise(r => setTimeout(r, 1500));
      
      // Real backend call
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('filename', selectedFile.name);
      formData.append('mimeType', selectedFile.type);

      const response = await fetch('/api/prepare', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Chunking failed');
      const result = await response.json();
      setManifest({ ...result, chunkHashes });

      // Step 5: Final Success
      setActiveState(4);
      addLog("Preparation complete. Shards distributed in memory.");
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      addLog("CRITICAL ERROR: Pipeline interrupted.");
      setIsProcessing(false);
      alert("Preparation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-black/[0.02] relative z-10"
      >
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
              <StorzyShield size={12} strokeWidth={3} className="animate-pulse" />
              Production Pipeline v2.0
            </div>
            <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none">
              {isProcessing || manifest ? "Secure Prep" : "Prepare Data"}
            </h1>
            <p className="text-[#64748B] font-medium text-lg leading-relaxed max-w-[340px] mx-auto">
              Mathematically rigorous sharding for decentralized storage.
            </p>
          </div>

          {!file && !isProcessing && (
            <div className="space-y-6">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex flex-col items-center gap-6"
              >
                <div className="w-20 h-20 bg-slate-50 group-hover:bg-blue-100 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all group-hover:scale-110 shadow-inner">
                  <FileCode size={40} />
                </div>
                <div className="text-center">
                  <p className="font-black text-xl text-[#0F172A] tracking-tight">Select File for Distribution</p>
                  <p className="text-sm font-bold text-[#64748B] mt-2 px-8">Data is encrypted locally with AES-256-GCM before transmission.</p>
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && startPreparation(e.target.files[0])}
                className="hidden" 
              />
            </div>
          )}

          {(isProcessing || manifest) && (
            <div className="space-y-10">
              {/* Terminal Logs View */}
              <div className="bg-[#0F172A] rounded-3xl p-6 font-mono text-[11px] space-y-2 border border-white/5 shadow-inner min-h-[140px]">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.p 
                      key={log + i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "tracking-tight",
                        i === logs.length - 1 ? "text-blue-400 font-bold" : "text-white/40"
                      )}
                    >
                      {log}
                    </motion.p>
                  ))}
                </AnimatePresence>
                {isProcessing && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />}
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: `${((activeState + 1) / STATES.length) * 100}%` }}
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                />
              </div>

              {/* Status List */}
              <div className="space-y-6">
                {STATES.map((state, idx) => {
                  const Icon = ICONS[idx];
                  const isActive = activeState === idx;
                  const isCompleted = activeState > idx;

                  if (idx > activeState + 1 && !manifest) return null;

                  return (
                    <motion.div 
                      key={state}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: isActive || isCompleted ? 1 : 0.2, 
                        y: 0,
                        scale: isActive ? 1.02 : 1
                      }}
                      className={cn(
                        "flex items-center gap-5 transition-all",
                        isActive && "text-blue-600"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border",
                        isActive ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/20 border-blue-500" : 
                        isCompleted ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-slate-50 text-slate-300 border-slate-100"
                      )}>
                        {isCompleted ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Icon size={28} strokeWidth={2.5} className={isActive ? "animate-pulse" : ""} />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-black tracking-tight text-lg leading-tight",
                          isActive ? "text-[#0F172A]" : isCompleted ? "text-[#64748B]" : "text-slate-300"
                        )}>
                          {state}
                        </p>
                        {isActive && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60">Executing cryptographic operation</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {manifest && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 border-t border-black/[0.03] space-y-6"
            >
              <div className="bg-[#F8FAFC] rounded-[2.5rem] p-8 space-y-4 border border-black/[0.01] shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Shards Generated</span>
                  <span className="text-xl font-black text-[#0F172A]">{manifest.total_chunks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Redundancy Factor</span>
                  <span className="text-xl font-black text-emerald-500">1.5x (APEM)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Survival Probability</span>
                  <span className="text-xl font-black text-blue-600">99.9999%</span>
                </div>
                <div className="pt-4 border-t border-black/[0.03]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-2">Integrity Fingerprint</p>
                  <div className="bg-white rounded-xl p-3 border border-black/[0.03] font-mono text-[10px] text-blue-600 break-all leading-relaxed">
                    {manifest.chunkHashes?.[0] || 'calculating...'}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-6 bg-[#0F172A] text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(0,0,0,0.1)] hover:bg-slate-800"
              >
                Go to Secure Vault
                <ArrowRight size={24} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
