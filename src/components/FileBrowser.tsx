"use client";

import * as React from "react";
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  MoreHorizontal, 
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  X,
  Download,
  Trash2,
  Check,
  FileCode,
  FileArchive,
  LayoutGrid,
  List,
  Star,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { recoverAndReassemble, recoverThumbnail } from "@/lib/storage";

interface FileBrowserProps {
  user: any;
  profile: any;
}

const CategoryCard = ({ icon: Icon, label, count, color, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-start bg-white p-5 rounded-[2rem] border border-black/[0.02] shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all text-left w-full",
      active && "ring-2"
    )}
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/50", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-lg text-[#0F172A] tracking-tight">{label}</h3>
    <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mt-1">{count} items</p>
  </button>
);

const FileRow = ({ file, onDownload, onPreview, isSelected, onSelect, selectionMode, onToggleStar }: any) => {
  const Icon = file.mime_type?.startsWith('image/') ? ImageIcon : 
               file.mime_type?.startsWith('video/') ? Video : FileText;
  const dateStr = new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  return (
    <div 
      onClick={() => selectionMode ? onSelect(file.id) : onPreview(file)}
      className={cn(
        "flex items-center gap-4 py-4 transition-all cursor-pointer group px-2 rounded-2xl relative select-none",
        isSelected ? "bg-blue-50/50" : "hover:bg-[#F8FAFC]"
      )}
    >
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
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 border-b border-black/[0.03] pb-4 group-last:border-none group-last:pb-0">
        <h4 className="font-bold text-[#0F172A] truncate text-sm">{file.name}</h4>
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{dateStr} • {sizeStr}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(file.id, !file.is_starred); }}
          className={cn("p-2 transition-all active:scale-90", file.is_starred ? "text-amber-400" : "text-[#94A3B8] hover:text-[#64748B]")}
        >
          <Star size={20} fill={file.is_starred ? "currentColor" : "none"} />
        </button>
        {!selectionMode && <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-[#94A3B8] hover:text-[#0F172A]"><MoreHorizontal size={18} /></button>}
      </div>
    </div>
  );
};

const FileCard = ({ file, onDownload, onPreview, isSelected, onSelect, selectionMode, onToggleStar }: any) => {
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const isImage = file.mime_type?.startsWith('image/');
  const isVideo = file.mime_type?.startsWith('video/');
  const isPdf = file.mime_type === 'application/pdf';
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  React.useEffect(() => {
    let url: string | null = null;
    if (isImage) {
      recoverThumbnail(file.id).then(blob => {
        if (blob) {
          url = URL.createObjectURL(blob);
          setThumbnailUrl(url);
        }
      });
    }
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [file.id, isImage]);

  return (
    <motion.div 
      layout
      whileHover={{ y: -5 }}
      onClick={() => selectionMode ? onSelect(file.id) : onPreview(file)}
      className={cn(
        "group relative bg-white rounded-[2rem] border border-black/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer transition-all",
        isSelected && "ring-2 ring-blue-500 shadow-blue-500/10 bg-blue-50/30"
      )}
    >
      <div onClick={(e) => { e.stopPropagation(); onSelect(file.id); }} className={cn("absolute top-4 left-4 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", isSelected ? "bg-blue-600 border-blue-600 scale-110" : "bg-white/80 backdrop-blur border-black/10 opacity-0 group-hover:opacity-100", selectionMode && "opacity-100")}>
        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
      </div>
      <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={(e) => { e.stopPropagation(); onToggleStar(file.id, !file.is_starred); }} className={cn("p-2 backdrop-blur rounded-xl shadow-lg transition-all active:scale-95", file.is_starred ? "bg-amber-400 text-white" : "bg-white/90 hover:bg-white text-slate-600")}>
          <Star size={16} fill={file.is_starred ? "currentColor" : "none"} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDownload(file); }} className="p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white text-slate-600"><Download size={16} /></button>
      </div>
      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center">
        {isImage && thumbnailUrl ? <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" /> : (
          <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner", isImage ? "bg-blue-100 text-blue-500" : isVideo ? "bg-purple-100 text-purple-500" : isPdf ? "bg-orange-100 text-orange-500" : "bg-slate-100 text-slate-400")}>
            {isImage ? <ImageIcon size={32} /> : isVideo ? <Video size={32} /> : isPdf ? <FileText size={32} /> : <FileCode size={32} />}
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white tracking-widest uppercase">{extension}</div>
      </div>
      <div className="p-4 space-y-1">
        <h4 className="font-bold text-slate-900 truncate text-sm leading-tight">{file.name}</h4>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const FileBrowser = ({ user, profile }: FileBrowserProps) => {
  const { vaultKey } = useAppState() as any;
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [layout, setLayout] = React.useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = React.useState<"date" | "name" | "size">("date");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [previewFile, setPreviewFile] = React.useState<any | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchFiles = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('files').select('*').eq('owner_id', user.id).eq('is_deleted', false);
    setFiles(data || []);
    setLoading(false);
  }, [user, supabase]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredFiles = React.useMemo(() => {
    return files
      .filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || 
          (filterCategory === "photo" && file.mime_type?.startsWith('image/')) ||
          (filterCategory === "video" && file.mime_type?.startsWith('video/')) ||
          (filterCategory === "doc" && (file.mime_type?.startsWith('application/') || file.mime_type?.startsWith('text/'))) ||
          (filterCategory === "starred" && file.is_starred);
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "size") return b.size - a.size;
        return 0;
      });
  }, [files, searchQuery, sortBy, filterCategory]);

  const handleToggleStar = async (id: string, isStarred: boolean) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, is_starred: isStarred } : f));
    try {
      const { error } = await supabase.from('files').update({ is_starred: isStarred }).eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, is_starred: !isStarred } : f));
      alert("Failed to update star state: " + error.message);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const blob = await recoverAndReassemble(file.id, { key: 'c29tZV9rZXk=', iv: 'c29tZV9pdg==' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name;
      a.click(); window.URL.revokeObjectURL(url);
    } catch (error: any) { alert("Download Failed: " + error.message); }
  };

  const handleBulkDelete = async () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    setBulkLoading(true);
    try {
      const { error } = await supabase.from('files').update({ is_deleted: true }).in('id', selectedIds);
      if (error) throw error;
      await fetchFiles();
      setSelectedIds([]); setShowDeleteConfirm(false);
    } catch (error: any) { alert("Bulk delete failed: " + error.message); } finally { setBulkLoading(false); }
  };

  const handleBulkDownload = async () => {
    setBulkLoading(true);
    try {
      const zip = new JSZip();
      for (const id of selectedIds) {
        const file = files.find(f => f.id === id);
        if (file) {
          const blob = await recoverAndReassemble(file.id, { key: 'c29tZV9rZXk=', iv: 'c29tZV9pdg==' });
          zip.file(file.name, blob);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url; a.download = `STORZY_Archive.zip`;
      a.click(); window.URL.revokeObjectURL(url);
      setSelectedIds([]);
    } catch (error: any) { alert("Bulk download failed: " + error.message); } finally { setBulkLoading(false); }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
        <input type="text" placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[2rem] py-5 pl-14 pr-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CategoryCard onClick={() => setFilterCategory("photo")} icon={ImageIcon} label="Photos" count={profile?.photo_count || 0} color="text-blue-500" active={filterCategory === "photo"} />
        <CategoryCard onClick={() => setFilterCategory("doc")} icon={FileText} label="Docs" count={profile?.doc_count || 0} color="text-orange-500" active={filterCategory === "doc"} />
        <CategoryCard onClick={() => setFilterCategory("video")} icon={Video} label="Videos" count={profile?.video_count || 0} color="text-purple-500" active={filterCategory === "video"} />
        <CategoryCard onClick={() => setFilterCategory("starred")} icon={Star} label="Starred" count={files.filter(f => f.is_starred).length} color="text-amber-500" active={filterCategory === "starred"} />
        <CategoryCard onClick={() => setFilterCategory("all")} icon={MoreHorizontal} label="All Files" count={files.length} color="text-emerald-500" active={filterCategory === "all"} />
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">{filterCategory === "all" ? "Files" : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-black/[0.03] rounded-xl p-1 shadow-sm">
              <button onClick={() => setLayout("grid")} className={cn("p-1.5 rounded-lg", layout === "grid" ? "bg-slate-100 text-[#0F172A]" : "text-[#94A3B8]")}><LayoutGrid size={16} /></button>
              <button onClick={() => setLayout("list")} className={cn("p-1.5 rounded-lg", layout === "list" ? "bg-slate-100 text-[#0F172A]" : "text-[#94A3B8]")}><List size={16} /></button>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 bg-white border border-black/[0.03] rounded-xl text-xs font-bold text-[#64748B] focus:outline-none"><option value="date">Newest</option><option value="name">Name</option><option value="size">Size</option></select>
          </div>
        </div>

        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px]">
            {filteredFiles.map(file => (<FileCard key={file.id} file={file} onDownload={handleDownload} onPreview={setPreviewFile} isSelected={selectedIds.includes(file.id)} onSelect={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} selectionMode={selectedIds.length > 0} onToggleStar={handleToggleStar} />))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-black/[0.02] shadow-[0_10px_40px_rgba(0,0,0,0.02)] p-6 divide-y divide-black/[0.03]">
            {filteredFiles.map(file => (<FileRow key={file.id} file={file} onDownload={handleDownload} onPreview={setPreviewFile} isSelected={selectedIds.includes(file.id)} onSelect={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} selectionMode={selectedIds.length > 0} onToggleStar={handleToggleStar} />))}
          </div>
        )}
      </div>

      {selectedIds.length === 0 && (
        <button onClick={() => router.push('/prep-v2')} className="fixed bottom-28 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"><Plus size={32} strokeWidth={3} /></button>
      )}

      {/* BulkActionBar logic simplified here for brevity, or can be moved to its own component */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-[#0F172A] text-white p-4 rounded-[2.5rem] flex items-center justify-between border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 ml-2">
              <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
              <div className="flex flex-col"><span className="font-black text-lg">{selectedIds.length}</span><span className="text-[10px] text-white/40 uppercase">Selected</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleBulkDownload} className="px-6 py-3 bg-white/10 rounded-2xl font-bold text-sm">Download</button>
              <button onClick={handleBulkDelete} className="px-6 py-3 bg-red-600 rounded-2xl font-bold text-sm">{showDeleteConfirm ? "Confirm?" : "Delete"}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* PreviewModal logic could also be isolated */}
    </div>
  );
};
