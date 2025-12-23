"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  ShieldCheck, 
  File, 
  X, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { encryptFileSimple } from "@/lib/storage";
import { createClient } from "@/lib/supabase-browser";

export default function UploadPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<"idle" | "encrypting" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus("encrypting");
    setProgress(20);

    try {
      // 1. Client-side encryption
      const { encryptedBlob, encryptionDetails } = await encryptFileSimple(file);
      
      setStatus("uploading");
      setProgress(50);

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('filename', file.name);

      // 3. Secure Transfer to Backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      
      // 4. Register in Supabase (Private Node Management)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('files').insert({
          owner_id: session.user.id,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          encryption_method: 'AES-256-GCM',
          storage_path: result.path,
          is_deleted: false
        });
      }

      setProgress(100);
      setStatus("success");
      
      // Redirect back after success
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus("error");
      setErrorMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="absolute top-8 left-8">
        <button 
          onClick={() => router.push('/')}
          className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#111827] rounded-[3rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        <div className="p-10 md:p-14 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-blue-500 border border-blue-500/20">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">Secure Upload</h1>
              <p className="text-[#9CA3AF] text-sm font-medium">Your data is yours. Encrypted before it leaves.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" || status === "error" ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className={cn(
                    "relative group cursor-pointer aspect-[16/9] rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4",
                    file ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <File size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-sm truncate max-w-[240px]">{file.name}</p>
                        <p className="text-[#9CA3AF] text-[10px] font-black uppercase tracking-widest mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 text-white/40 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="text-white/40 font-bold text-sm">Drag and drop or click to pick</p>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur rounded-full">
                    <Lock size={10} className="text-blue-400" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Client-Side AES-256-GCM</span>
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                    {errorMessage}
                  </p>
                )}

                <button 
                  disabled={!file || uploading}
                  onClick={handleUpload}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98]"
                >
                  {file ? "Securely Upload" : "Select a File"}
                </button>
              </motion.div>
            ) : status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                  <CheckCircle2 size={80} className="text-emerald-500 relative" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Upload Confirmed</h3>
                  <p className="text-[#9CA3AF] text-sm font-medium max-w-xs mx-auto">Your file was encrypted and stored securely. Redirecting to your vault...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center gap-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                  <Loader2 className="animate-spin text-blue-500 relative" size={64} strokeWidth={2.5} />
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-white font-black text-sm tracking-tight uppercase">
                      {status === "encrypting" ? "Encrypting Locally..." : "Transferring Shards..."}
                    </p>
                    <p className="text-blue-500 font-black text-lg">{progress}%</p>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                  <p className="text-[#9CA3AF] text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    Zero-Knowledge Pipeline Active
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
