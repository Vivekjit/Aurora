"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Save, X, Plus, Image as ImageIcon, Type, AlignLeft, Trash2, Upload, Loader } from "lucide-react";

const ADMIN_EMAIL = "dasvivekjitbui@gmail.com"; 

// Define Block Types
type Block = {
  type: "subheading" | "text" | "image";
  value: string;
};

export default function AuroraEditorial() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null); // Track which block is uploading
  
  // State
  const [title, setTitle] = useState("Loading...");
  const [headline, setHeadline] = useState("...");
  const [coverImage, setCoverImage] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch Data
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) setIsAdmin(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/editorial/latest`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setHeadline(data.headline);
        setCoverImage(data.cover_image);
        // Ensure blocks is an array
        setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
      })
      .catch(err => console.error("CMS Error:", err));
  }, [user]);

  // Save Data
  const handleSave = async () => {
    if (!user) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/editorial/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title, 
            headline, 
            cover_image: coverImage, 
            blocks, 
            admin_email: user.email 
        })
      });
      setIsEditing(false);
    } catch (e) {
      alert("Failed to publish.");
    }
  };

  // --- EDITOR HELPERS ---

  const addBlock = (type: "subheading" | "text" | "image") => {
    setBlocks([...blocks, { type, value: "" }]);
  };

  const updateBlock = (index: number, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].value = value;
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  // ✅ NEW: Handle S3 Image Upload
  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;
    setUploadingIndex(index);

    try {
      // 1. Get Signed URL from Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          file_type: file.type,
          realm: "Editorial" // Save in a specific folder
        })
      });
      const data = await res.json();

      // 2. Upload directly to S3
      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      // 3. Update the block with the permanent URL
      updateBlock(index, data.public_url);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Check AWS credentials.");
    } finally {
      setUploadingIndex(null);
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto mb-12 relative group perspective-1000">
      
      <div className={`
        relative overflow-hidden rounded-[40px] border border-white/10 shadow-2xl transition-all duration-700
        ${isEditing ? 'min-h-[600px] bg-black' : 'min-h-[500px] bg-gray-900'}
      `}>
        
        {/* --- 1. COVER HEADER --- */}
        <div className="relative h-96 w-full">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-10">
                <div className="px-3 py-1 mb-4 w-fit rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] tracking-[0.3em] font-bold uppercase text-white/80">
                    Editorial
                </div>
                {isEditing ? (
                    <div className="flex flex-col gap-4">
                        <input className="bg-black/50 border border-white/20 p-4 rounded-xl text-3xl font-bold text-white w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Main Title" />
                        <input className="bg-black/50 border border-white/20 p-3 rounded-xl text-lg italic text-white/80 w-full" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Subtitle" />
                        <input className="bg-black/50 border border-white/20 p-2 rounded-xl text-xs font-mono text-cyan-400 w-full" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="Cover Image URL (Or paste here)" />
                    </div>
                ) : (
                    <>
                        <h1 className="font-mercedes font-bold text-5xl md:text-6xl text-white leading-tight drop-shadow-2xl">{title}</h1>
                        <h2 className="font-mercedes text-xl md:text-2xl text-gray-300 italic mt-2">{headline}</h2>
                    </>
                )}
            </div>
        </div>

        {/* --- 2. THE CONTENT BODY (Blocks) --- */}
        <div className="bg-black px-8 md:px-12 pb-12 pt-4 min-h-[200px]">
            
            {/* VIEW MODE */}
            {!isEditing && (
                <div className="flex flex-col gap-8">
                    {blocks.map((block, i) => (
                        <div key={i} className="animate-fade-in-up" style={{animationDelay: `${i * 100}ms`}}>
                            {block.type === "subheading" && (
                                <h3 className="font-mercedes text-2xl text-cyan-100 border-l-4 border-cyan-500 pl-4 mt-4">
                                    {block.value}
                                </h3>
                            )}
                            {block.type === "text" && (
                                // ✅ COSMETIC CHANGE: Added 'italic' class by default
                                <p className="font-sans text-lg text-gray-400 leading-relaxed whitespace-pre-wrap italic">
                                    {block.value}
                                </p>
                            )}
                            {block.type === "image" && (
                                <div className="rounded-2xl overflow-hidden my-4 border border-white/10 shadow-lg">
                                    <img src={block.value} alt="Editorial content" className="w-full h-auto object-cover" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
                <div className="flex flex-col gap-4">
                    <p className="text-xs uppercase tracking-widest text-cyan-500 mb-2">Content Blocks</p>
                    
                    {blocks.map((block, i) => (
                        <div key={i} className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-colors">
                            {/* Remove Button */}
                            <button onClick={() => removeBlock(i)} className="absolute top-2 right-2 p-2 text-red-400 hover:text-red-200 opacity-50 hover:opacity-100 z-10">
                                <Trash2 size={16} />
                            </button>

                            {/* Input Fields */}
                            {block.type === "subheading" && (
                                <div className="flex items-center gap-3">
                                    <Type size={18} className="text-cyan-400" />
                                    <input className="bg-transparent w-full text-xl font-bold text-white focus:outline-none placeholder-white/20" value={block.value} onChange={e => updateBlock(i, e.target.value)} placeholder="Subheading..." />
                                </div>
                            )}
                            {block.type === "text" && (
                                <div className="flex items-start gap-3">
                                    <AlignLeft size={18} className="text-gray-400 mt-1" />
                                    {/* ✅ COSMETIC CHANGE: Added 'italic' to textarea input */}
                                    <textarea className="bg-transparent w-full text-sm text-gray-300 italic focus:outline-none placeholder-white/20 resize-none h-24" value={block.value} onChange={e => updateBlock(i, e.target.value)} placeholder="Paragraph text (will be italic)..." />
                                </div>
                            )}
                            {block.type === "image" && (
                                <div className="flex flex-col gap-3">
                                    {/* ✅ NEW: Upload Interface */}
                                    <div className="flex items-center gap-3">
                                        <ImageIcon size={18} className="text-purple-400" />
                                        
                                        {/* URL Input */}
                                        <input 
                                            className="bg-transparent w-full text-xs font-mono text-purple-200 focus:outline-none placeholder-white/20" 
                                            value={block.value} 
                                            onChange={e => updateBlock(i, e.target.value)} 
                                            placeholder="Paste URL OR Upload File ->" 
                                        />

                                        {/* File Upload Button */}
                                        <label className="cursor-pointer p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors relative">
                                            {uploadingIndex === i ? (
                                                <Loader size={16} className="animate-spin text-cyan-400" />
                                            ) : (
                                                <Upload size={16} className="text-cyan-400" />
                                            )}
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], i)}
                                                disabled={uploadingIndex !== null}
                                            />
                                        </label>
                                    </div>
                                    
                                    {/* Preview */}
                                    {block.value && !uploadingIndex && (
                                        <img src={block.value} className="h-24 w-full rounded-lg object-cover border border-white/20" />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        <button onClick={() => addBlock("subheading")} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs uppercase tracking-wider text-cyan-400"><Type size={14} /> Header</button>
                        <button onClick={() => addBlock("text")} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs uppercase tracking-wider text-gray-400"><AlignLeft size={14} /> Text</button>
                        <button onClick={() => addBlock("image")} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-xs uppercase tracking-wider text-purple-400"><ImageIcon size={14} /> Image</button>
                    </div>
                </div>
            )}
        </div>

        {/* --- CONTROLS --- */}
        {isAdmin && (
            <div className="absolute top-6 right-6 z-50 flex gap-2">
                {isEditing ? (
                    <>
                        <button onClick={() => setIsEditing(false)} className="p-3 rounded-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white backdrop-blur-md transition-all"><X size={18} /></button>
                        <button onClick={handleSave} className="p-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-white backdrop-blur-md transition-all"><Save size={18} /></button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Pencil size={16} /></button>
                )}
            </div>
        )}

      </div>
    </div>
  );
}