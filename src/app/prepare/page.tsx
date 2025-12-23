"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield as ShieldIcon, 
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
  "Preparing file securely…",
  "Splitting encrypted data…",
  "Generating integrity proof…",
  "File ready for decentralized storage"
];

const ICONS = [
  ShieldIcon,
  Layers,
  Fingerprint,
  CheckCircle2
];

export default function ChunkPreparationPage() {
  const [activeState, setActiveState] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [manifest, setManifest] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const startPreparation = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    setActiveState(0);

    try {
      // Step 1: Client-side encryption (Never decrypt on server)
      const { encryptedChunks } = await encryptFile(selectedFile);
      
      const encryptedBlob = new Blob(encryptedChunks);
      
      // Step 2: Transition to splitting
      setActiveState(1);
      await new Promise(r => setTimeout(r, 1500));

      // Step 3: Transition to integrity proof
      setActiveState(2);
      
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
      setManifest(result);

      // Step 4: Final Success
      setActiveState(3);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert("Preparation failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-black/[0.02] relative z-10"
      >
        <div className="space-y-12">
          {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldIcon size={12} strokeWidth={3} />
                Zero-Knowledge Pipeline
              </div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tight leading-none">
              {isProcessing || manifest ? "Secure Prep" : "Prepare File"}
            </h1>
            <p className="text-[#64748B] font-medium text-lg leading-relaxed max-w-[300px] mx-auto">
              Readying data for the decentralized mesh.
            </p>
          </div>

          {!file && !isProcessing && (
            <div className="space-y-6">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <FileCode size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[#0F172A]">Choose file to prepare</p>
                  <p className="text-xs font-medium text-[#64748B] mt-1">Encrypted locally before upload</p>
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
              {/* Progress Bar */}
              <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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

                  return (
                    <motion.div 
                      key={state}
                      initial={{ opacity: 0.3, x: -10 }}
                      animate={{ 
                        opacity: isActive || isCompleted ? 1 : 0.3, 
                        x: 0,
                        scale: isActive ? 1.02 : 1
                      }}
                      className={cn(
                        "flex items-center gap-5 transition-all",
                        isActive && "text-blue-600"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : 
                        isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                      )}>
                        {isCompleted ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Icon size={24} strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-black tracking-tight",
                          isActive ? "text-[#0F172A]" : isCompleted ? "text-[#64748B]" : "text-slate-400"
                        )}>
                          {state}
                        </p>
                        {isActive && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 mt-1"
                          >
                            <Loader2 className="animate-spin text-blue-600" size={12} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Active Processing</span>
                          </motion.div>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 border-t border-black/[0.03] space-y-6"
            >
              <div className="bg-[#F8FAFC] rounded-[2rem] p-6 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                  <span>Chunks Generated</span>
                  <span className="text-blue-600">{manifest.total_chunks}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                  <span>Chunk Size</span>
                  <span className="text-blue-600">{(manifest.chunk_size / (1024 * 1024)).toFixed(0)} MB</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                  <span>Integrity Hash</span>
                  <span className="text-[#0F172A] truncate ml-4 font-mono">{manifest.file_id.slice(0, 12)}...</span>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-6 bg-[#0F172A] text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
              >
                Go to Files
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
