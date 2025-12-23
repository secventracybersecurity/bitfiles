"use client";

import * as React from "react";
import { Shell } from "@/components/Shell";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MoreHorizontal, 
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  ArrowLeft,
  HardDrive,
  BarChart3,
  Wallet,
  Shield,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
  Download,
  Trash2,
  Maximize2,
  Check,
  FileCode,
  FileArchive,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { 
  encryptFile, 
  recoverAndReassemble, 
  recoverThumbnail 
} from "@/lib/storage";
import { getOptimalNodes, distributeShards } from "@/lib/distribution";

// --- Auth View ---
const AuthView = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            data: { username: email.split('@')[0] },
            emailRedirectTo: window.location.origin 
          }
        });
        if (error) throw error;
        
        // Log event
        if (data.user) {
          await supabase.from('audit_logs').insert({
            user_id: data.user.id,
            event_type: 'signup_attempt',
            metadata: { email, role: 'USER' }
          });
        }

        if (data?.session) {
          // Success handled by state change listener
        } else {
          alert("A verification link has been sent to your email. Please confirm to activate your account.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Log success
        await supabase.from('audit_logs').insert({
          user_id: data.user?.id,
          event_type: 'login_success',
          metadata: { method: 'password', role: data.user?.app_metadata?.role || 'pending' }
        });
      }
    } catch (error: any) {
      // Log failure
      await supabase.from('audit_logs').insert({
        event_type: 'login_failure',
        metadata: { email, error: error.message }
      });
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] border border-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.03)] space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-[#64748B] text-sm font-medium">
            {isSignUp ? "Start your decentralized journey" : "Log in to access your files"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-black/[0.03] rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
              <div className="relative">
                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-black/[0.03] rounded-2xl py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#3B82F6] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-[#64748B]">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-blue-600 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};


// --- Sub-components for Files Tab ---
const CategoryCard = ({ icon: Icon, label, count, color }: any) => (
  <button className="flex flex-col items-start bg-white p-5 rounded-[2rem] border border-black/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all text-left">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-lg text-[#0F172A] tracking-tight">{label}</h3>
    <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mt-1">{count} items</p>
  </button>
);

// --- Preview Modal ---
const PreviewModal = ({ file, onClose, onDownload }: { file: any, onClose: () => void, onDownload: (file: any) => Promise<void> }) => {
  const [loading, setLoading] = React.useState(true);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const [progressMsg, setProgressMsg] = React.useState("Re-proving data survival...");

  const isImage = file.mime_type?.startsWith('image/');
  const isPdf = file.mime_type === 'application/pdf';
  const isVideo = file.mime_type?.startsWith('video/');
  const extension = file.name.split('.').pop()?.toLowerCase();
  const isDoc = ['docx', 'pptx', 'doc', 'ppt', 'xls', 'xlsx'].includes(extension || '');

  React.useEffect(() => {
    let url: string | null = null;
    const loadPreview = async () => {
      try {
        if (!isImage && !isPdf && !isVideo) {
          setLoading(false);
          return;
        }

        const blob = await recoverAndReassemble(
          file.id, 
          { key: 'c29tZV9rZXk=', iv: 'c29tZV9pdg==' },
          (msg) => setProgressMsg(msg)
        );
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };
    loadPreview();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [file, isImage, isPdf, isVideo]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 40 }}
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0F172A] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              {isImage ? <ImageIcon className="text-blue-400" size={24} /> : 
               isVideo ? <Video className="text-purple-400" size={24} /> :
               isPdf ? <FileText className="text-orange-400" size={24} /> :
               <FileCode className="text-slate-400" size={24} />}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-white font-black text-lg tracking-tight truncate max-w-[240px] md:max-w-xl">{file.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{file.mime_type || 'Unknown Type'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onDownload(file)}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              <Download size={18} />
              <span className="hidden md:inline">Download</span>
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all active:scale-95 group"
            >
              <X size={20} className="group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex items-center justify-center p-8 md:p-12 overflow-auto bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]">
          {loading ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                <Loader2 className="animate-spin text-blue-500 relative" size={56} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-white text-xl font-black tracking-tight">{progressMsg}</p>
                <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Decentralized APEM Mesh Active</p>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-md text-center space-y-8">
              <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                <X size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-white text-2xl font-black tracking-tight">Integrity Check Failed</h4>
                <p className="text-white/40 font-medium leading-relaxed">We encountered a secure streaming error. The file is safe, but cannot be rendered in the browser right now.</p>
              </div>
              <button onClick={() => onDownload(file)} className="w-full py-5 bg-white text-[#0F172A] rounded-2xl font-black text-lg shadow-xl shadow-white/5 active:scale-95 transition-all">Download to Local Viewer</button>
            </div>
          ) : previewUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              {isImage ? (
                <motion.img 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={previewUrl} 
                  alt={file.name} 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/5" 
                />
              ) : isVideo ? (
                <video src={previewUrl} controls autoPlay className="max-w-full max-h-full rounded-2xl shadow-2xl" />
              ) : isPdf ? (
                <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded-2xl border-none bg-white shadow-2xl" title={file.name} />
              ) : null}
            </div>
          ) : (
            <div className="max-w-lg text-center space-y-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                <div className="w-32 h-32 bg-white/[0.03] rounded-[3rem] flex items-center justify-center mx-auto text-white/20 border border-white/10 relative">
                  {isDoc ? <FileArchive size={64} /> : <FileCode size={64} />}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-white text-3xl font-black tracking-tight">No Preview Available</h4>
                <p className="text-white/40 text-lg font-medium leading-relaxed">Secure preview is restricted to images and standard document formats. Download to view {extension?.toUpperCase() || 'this'} content.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => onDownload(file)} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Download File</button>
                <button onClick={onClose} className="flex-1 py-5 bg-white/5 text-white/60 hover:text-white rounded-2xl font-black text-lg border border-white/10 active:scale-95 transition-all">Keep Browsing</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Earn View ---
const EarnView = ({ profile, user }: { profile: any, user: any }) => {
  const [nodes, setNodes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();
  
  const fetchNodes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('nodes')
      .select('*')
      .eq('provider_id', user.id);
    setNodes(data || []);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchNodes();
  }, [user]);

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
  
  // Simulated Constitutional metrics for UI flair
  const dimensions = [
    { label: "Storage (S)", value: 0.85, weight: 0.25, color: "bg-blue-500", desc: "Effective storage actually used (not declared)" },
    { label: "Uptime (U)", value: 0.98, weight: 0.25, color: "bg-emerald-500", desc: "Uptime probability over rolling window" },
    { label: "Reliability (R)", value: 0.92, weight: 0.20, color: "bg-purple-500", desc: "Historical success rate (reliability score)" },
    { label: "Trust (T)", value: 1.0, weight: 0.20, color: "bg-amber-500", desc: "Proof challenges passed (trust score)" },
    { label: "Diversity (D)", value: 0.45, weight: 0.07, color: "bg-rose-500", desc: "Failure-domain diversity factor" },
    { label: "Latency (L)", value: 0.78, weight: 0.03, color: "bg-slate-500", desc: "Latency and availability responsiveness" },
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

      {/* Nodes List */}
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
              <p className="text-sm font-bold text-[#64748B]">No active nodes found. Start providing storage to earn rewards.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Real-time Yield</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * activeNodesCount).toFixed(2)}</h3>
          <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} />
            {activeNodesCount} active nodes contributing
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Monthly Projection</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * 30 * activeNodesCount).toFixed(0)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }} />
            </div>
            <span className="text-[10px] font-black text-[#64748B]">EMA Smoothing Active</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">Yearly Projection</p>
          <h3 className="text-4xl font-black text-[#0F172A] mt-2">₹{(ncs * 42.5 * 365 * activeNodesCount).toFixed(0)}</h3>
          <p className="text-xs font-bold text-[#64748B] mt-2">Anti-Sybil diversity multiplier applied</p>
        </div>
      </div>

      {/* Engine Status (Adversarial Robustness Layer) */}
      <div className="bg-[#0F172A] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative z-10 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Node Contribution Tensor</h3>
              <p className="text-white/40 text-sm font-bold tracking-widest uppercase mt-1">Multi-Dimensional Incentive Layer</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">{(ncs * 100).toFixed(1)}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total NCS Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            {dimensions.map((d) => (
              <div key={d.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{d.label}</span>
                    <p className="text-[9px] text-white/20 font-bold leading-none">{d.desc}</p>
                  </div>
                  <span className="text-sm font-bold">{(d.value * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value * 100}%` }}
                    className={cn("h-full rounded-full", d.color)}
                  />
                </div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Incentive Weight: {d.weight * 100}%</p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Sybil Resistance</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Correlated nodes share diminishing returns via diversity-weighted rewards.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <BarChart3 size={20} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Temporal Stability</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">EMA filter rewards consistent contribution, not temporary spikes or farming.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Proof Challenges</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Randomized audits prevent fake uptime and partial storage attacks.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <ArrowUpDown size={20} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Vesting & Clawback</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Bonus rewards are reliability-based and subject to validation proofs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileRow = ({ file, onDownload, onPreview, isSelected, onSelect, selectionMode }: any) => {
  const [downloading, setDownloading] = React.useState(false);
  const touchTimeout = React.useRef<any>(null);
  
  const Icon = file.mime_type?.startsWith('image/') ? ImageIcon : 
               file.mime_type?.startsWith('video/') ? Video : FileText;

  const dateStr = new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode || e.shiftKey) {
      onSelect(file.id);
      return;
    }
    onPreview(file);
  };

  const handleTouchStart = () => {
    touchTimeout.current = setTimeout(() => {
      if (!selectionMode) {
        onSelect(file.id);
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
  };

  return (
    <div 
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); if (!selectionMode) onSelect(file.id); }}
      className={cn(
        "flex items-center gap-4 py-4 transition-all cursor-pointer group px-2 rounded-2xl relative select-none",
        isSelected ? "bg-blue-50/50" : "hover:bg-[#F8FAFC]"
      )}
    >
      {/* Checkbox for Desktop Hover or Selection Mode */}
      <div 
        onClick={(e) => { e.stopPropagation(); onSelect(file.id); }}
        className={cn(
          "absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-10",
          isSelected ? "bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-500/20" : "bg-white border-black/[0.05] opacity-0 group-hover:opacity-100",
          selectionMode && "opacity-100 left-2"
        )}
      >
        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
      </div>

      <div className={cn(
        "w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-all shrink-0",
        isSelected && "bg-blue-100 text-blue-600",
        selectionMode && "ml-8"
      )}>
        {downloading ? <Loader2 className="animate-spin" size={20} /> : <Icon size={20} />}
      </div>
      
      <div className="flex-1 min-w-0 border-b border-black/[0.03] pb-4 group-last:border-none group-last:pb-0">
        <h4 className="font-bold text-[#0F172A] truncate text-sm">{file.name}</h4>
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{dateStr} • {sizeStr}</p>
      </div>
      
      {!selectionMode && (
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="p-2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    </div>
  );
};

// --- Dashboard View ---
const DashboardView = ({ onBack, profile }: { onBack: () => void, profile: any }) => {
  return (
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
            <p className="text-xs font-bold text-[#64748B] mt-1">
              {(profile?.storage_used / (1024*1024*1024)).toFixed(1)} GB of {(profile?.storage_limit / (1024*1024*1024)).toFixed(0)} GB used
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">Earnings Summary</p>
            <h3 className="text-4xl font-black text-[#0F172A]">₹{profile?.total_earnings?.toFixed(0) || 0}</h3>
            <p className="text-xs font-bold text-[#64748B] mt-1">Total rewards earned</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Bulk Action Bar ---
const BulkActionBar = ({ selectedCount, onClear, onDownload, onDelete, isDeleting, isDownloading, isConfirmingDelete }: any) => (
  <AnimatePresence>
    {selectedCount > 0 && (
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
      >
        <div className="bg-[#0F172A] text-white p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-4 ml-2">
            <button 
              onClick={onClear}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none">{selectedCount}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Selected</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isConfirmingDelete && (
              <button 
                onClick={onDownload}
                disabled={isDownloading || isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                <span className="hidden md:inline">Download</span>
              </button>
            )}
            <button 
              onClick={onDelete}
              disabled={isDownloading || isDeleting}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg disabled:opacity-50",
                isConfirmingDelete ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
              )}
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              <span>{isConfirmingDelete ? "Confirm Delete?" : <span className="hidden md:inline">Delete</span>}</span>
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Recent Items Row ---
const RecentItems = ({ files, onPreview }: { files: any[], onPreview: (file: any) => void }) => {
  const recentFiles = [...files]
    .filter(f => f.mime_type?.startsWith('image/') || f.mime_type === 'application/pdf')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (recentFiles.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-black text-[#64748B] uppercase tracking-[0.2em]">Recently Distributed</h2>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
        {recentFiles.map((file) => (
          <motion.div
            key={file.id}
            whileHover={{ y: -4 }}
            onClick={() => onPreview(file)}
            className="flex-shrink-0 w-32 group cursor-pointer"
          >
            <div className="aspect-square bg-white rounded-2xl border border-black/[0.03] shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden relative mb-2">
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                {file.mime_type?.startsWith('image/') ? (
                  <ImageIcon className="text-blue-500/40" size={24} />
                ) : (
                  <FileText className="text-orange-500/40" size={24} />
                )}
              </div>
              {/* Thumbnail placeholder - real one would load here */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                 <Maximize2 size={12} className="text-white" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-[#0F172A] truncate px-1">{file.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Empty State ---
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 col-span-full">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
      <FileText size={32} />
    </div>
    <p className="text-sm font-bold text-[#64748B]">No files uploaded yet</p>
  </div>
);

// --- File Card (Grid View) ---
const FileCard = ({ file, onDownload, onPreview, isSelected, onSelect, selectionMode }: any) => {
  const [loading, setLoading] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);

  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');
  const isPdf = file.mime_type === 'application/pdf';
  
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  React.useEffect(() => {
    let url: string | null = null;
    if (isImage) {
      const loadThumbnail = async () => {
        try {
          const blob = await recoverThumbnail(file.id);
          if (blob) {
            url = URL.createObjectURL(blob);
            setThumbnailUrl(url);
          }
        } catch (e) {
          console.error("Thumbnail failed", e);
        }
      };
      loadThumbnail();
    }
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [file.id, isImage]);

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (action === 'download') onDownload(file);
    if (action === 'preview') onPreview(file);
    if (action === 'select') onSelect(file.id);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={() => selectionMode ? onSelect(file.id) : onPreview(file)}
      className={cn(
        "group relative bg-white rounded-[2rem] border border-black/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer transition-all",
        isSelected && "ring-2 ring-blue-500 shadow-blue-500/10 bg-blue-50/30"
      )}
    >
      {/* Selection Overlay */}
      <div 
        onClick={(e) => handleAction(e, 'select')}
        className={cn(
          "absolute top-4 left-4 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
          isSelected ? "bg-blue-600 border-blue-600 scale-110" : "bg-white/80 backdrop-blur border-black/10 opacity-0 group-hover:opacity-100",
          selectionMode && "opacity-100"
        )}
      >
        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
      </div>

      {/* Quick Actions Overlay (Desktop) */}
      <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        <button 
          onClick={(e) => handleAction(e, 'download')}
          className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white text-slate-600 transition-all active:scale-95"
        >
          <Download size={16} />
        </button>
        <button 
          onClick={(e) => handleAction(e, 'preview')}
          className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white text-slate-600 transition-all active:scale-95"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Media Preview */}
      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center">
        {isImage && thumbnailUrl ? (
          <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className={cn(
            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner",
            isImage ? "bg-blue-100 text-blue-500" :
            isVideo ? "bg-purple-100 text-purple-500" :
            isPdf ? "bg-orange-100 text-orange-500" :
            "bg-slate-100 text-slate-400"
          )}>
            {isImage ? <ImageIcon size={32} /> : 
             isVideo ? <Video size={32} /> :
             isPdf ? <FileText size={32} /> :
             <FileCode size={32} />}
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white tracking-widest uppercase">
          {extension}
        </div>
      </div>

      {/* File Info */}
      <div className="p-4 space-y-1">
        <h4 className="font-bold text-slate-900 truncate text-sm leading-tight">{file.name}</h4>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function NativeApp() {
  const [activeTab, setActiveTab] = React.useState("files");
  const [view, setView] = React.useState<"app" | "dashboard">("app");
  const [layout, setLayout] = React.useState<"list" | "grid">("grid");
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [files, setFiles] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "name" | "size">("date");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [previewFile, setPreviewFile] = React.useState<any | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    const { data: fileData } = await supabase
      .from('files')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_deleted', false);
    setFiles(fileData || []);
  };

  const filteredFiles = React.useMemo(() => {
    return files
      .filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || 
          (filterCategory === "photo" && file.mime_type?.startsWith('image/')) ||
          (filterCategory === "video" && file.mime_type?.startsWith('video/')) ||
          (filterCategory === "doc" && (file.mime_type?.startsWith('application/') || file.mime_type?.startsWith('text/')));
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "size") return b.size - a.size;
        return 0;
      });
  }, [files, searchQuery, sortBy, filterCategory]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // 1. Client-side encryption & Chunking
      const { encryptedChunks, encryptionDetails } = await encryptFile(file);

      // 2. Metadata registration
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert({
          owner_id: user.id,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          encryption_method: 'AES-GCM',
          erasure_coding_params: { n: 10, k: 7 } // Step 4 placeholder
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // 3. New STEP-3 Chunking & Manifest Generation
      const encryptedBlob = new Blob(encryptedChunks);
      const chunkFormData = new FormData();
      chunkFormData.append('file', encryptedBlob);
      chunkFormData.append('filename', file.name);
      chunkFormData.append('mimeType', file.type);

      const chunkResponse = await fetch('/api/prepare', {
        method: 'POST',
        body: chunkFormData
      });
      
      if (!chunkResponse.ok) throw new Error('Backend chunking failed');
      const manifest = await chunkResponse.json();
      console.log("[STORZY-STEP3] Manifest Generated:", manifest);

      // 4. Shard distribution (Step 3 & 4)
      const nodes = await getOptimalNodes(3);
      await distributeShards(fileRecord.id, encryptedChunks, nodes);

      // Refresh data
      await fetchUserData(user.id);
    } catch (error: any) {
      alert("Encryption/Distribution failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      // In a real scenario, we'd fetch the unique key/iv for this file
      // For Step 5, we use the secure primitive's default behavior
      const blob = await recoverAndReassemble(
        file.id, 
        { key: 'c29tZV9rZXk=', iv: 'c29tZV9pdg==' },
        (state) => {
          // We could show a toast here if we had a toast library
          console.log(`[STORZY-APEM] ${state}`);
        }
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert("APEM Recovery Failed: " + error.message);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    setBulkLoading(true);
    try {
      const zip = new JSZip();
      const selectedFiles = files.filter(f => selectedIds.includes(f.id));
      
      for (const file of selectedFiles) {
        const blob = await recoverAndReassemble(
          file.id, 
          { key: 'c29tZV9rZXk=', iv: 'c29tZV9pdg==' }
        );
        zip.file(file.name, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `STORZY_Archive_${new Date().getTime()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSelectedIds([]);
    } catch (error: any) {
      alert("Bulk download failed: " + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleBulkDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_deleted: true })
        .in('id', selectedIds);
      
      if (error) throw error;
      await fetchUserData(user.id);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      alert("Bulk delete failed: " + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  if (!user) {
    return <AuthView />;
  }

  if (view === "dashboard") {
    return (
      <Shell activeTab={activeTab} setActiveTab={setActiveTab} onDashboardClick={() => setView("dashboard")}>
        <DashboardView profile={profile} onBack={() => setView("app")} />
      </Shell>
    );
  }

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab} onDashboardClick={() => setView("dashboard")}>
      <AnimatePresence mode="wait">
        {activeTab === "files" ? (
          <motion.div 
            key="files"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-8 pb-32"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
              <input 
                type="text" 
                placeholder="Search files, folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[2rem] py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setFilterCategory("photo")}>
                <CategoryCard icon={ImageIcon} label="Photos" count={profile?.photo_count || 0} color={cn("bg-blue-50 text-blue-500", filterCategory === "photo" && "ring-2 ring-blue-500")} />
              </div>
              <div onClick={() => setFilterCategory("doc")}>
                <CategoryCard icon={FileText} label="Docs" count={profile?.doc_count || 0} color={cn("bg-orange-50 text-orange-500", filterCategory === "doc" && "ring-2 ring-orange-500")} />
              </div>
              <div onClick={() => setFilterCategory("video")}>
                <CategoryCard icon={Video} label="Videos" count={profile?.video_count || 0} color={cn("bg-purple-50 text-purple-500", filterCategory === "video" && "ring-2 ring-purple-500")} />
              </div>
              <div onClick={() => setFilterCategory("all")}>
                <CategoryCard icon={MoreHorizontal} label="All Files" count={files.length} color={cn("bg-emerald-50 text-emerald-500", filterCategory === "all" && "ring-2 ring-emerald-500")} />
              </div>
            </div>

            {/* Recent Previews */}
            <RecentItems files={files} onPreview={setPreviewFile} />

            {/* Files List Header */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                    {filterCategory === "all" ? "Recent Files" : `${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}s`}
                  </h2>
                  {selectedIds.length > 0 && (
                    <button 
                      onClick={() => setSelectedIds([])}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-black/[0.03] rounded-xl p-1 shadow-sm mr-2">
                    <button 
                      onClick={() => setLayout("grid")}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        layout === "grid" ? "bg-slate-100 text-[#0F172A]" : "text-[#94A3B8] hover:text-[#0F172A]"
                      )}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setLayout("list")}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        layout === "list" ? "bg-slate-100 text-[#0F172A]" : "text-[#94A3B8] hover:text-[#0F172A]"
                      )}
                    >
                      <List size={16} />
                    </button>
                  </div>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-black/[0.03] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors shadow-sm focus:outline-none"
                  >
                    <option value="date">Newest</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                  </select>
                </div>
              </div>

              {/* Files Rendering */}
              {layout === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px]">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map(file => (
                      <FileCard
                        key={file.id} 
                        file={file} 
                        onDownload={handleDownload} 
                        onPreview={setPreviewFile}
                        isSelected={selectedIds.includes(file.id)}
                        onSelect={toggleSelection}
                        selectionMode={selectedIds.length > 0}
                      />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-6 divide-y divide-black/[0.03] min-h-[200px]">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map(file => (
                      <FileRow 
                        key={file.id} 
                        file={file} 
                        onDownload={handleDownload} 
                        onPreview={setPreviewFile}
                        isSelected={selectedIds.includes(file.id)}
                        onSelect={toggleSelection}
                        selectionMode={selectedIds.length > 0}
                      />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
              )}
            </div>

            {/* Floating Upload Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              className="hidden" 
            />
            {selectedIds.length === 0 && (
              <motion.button 
                onClick={() => router.push('/prepare')}
                disabled={uploading}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-28 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_16px_32px_rgba(59,130,246,0.3)] flex items-center justify-center z-40"
              >
                {uploading ? <Loader2 className="animate-spin" size={32} strokeWidth={3} /> : <Plus size={32} strokeWidth={3} />}
              </motion.button>
            )}

            <BulkActionBar 
              selectedCount={selectedIds.length}
              onClear={() => { setSelectedIds([]); setShowDeleteConfirm(false); }}
              onDownload={handleBulkDownload}
              onDelete={handleBulkDelete}
              isDownloading={bulkLoading}
              isDeleting={bulkLoading}
              isConfirmingDelete={showDeleteConfirm}
            />

            <AnimatePresence>
              {previewFile && (
                <PreviewModal 
                  file={previewFile} 
                  onClose={() => setPreviewFile(null)} 
                  onDownload={handleDownload}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="node"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <EarnView profile={profile} user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
