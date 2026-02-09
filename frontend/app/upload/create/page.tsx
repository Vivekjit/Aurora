"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UploadCloud, Hash, Play, FileText, Image as ImageIcon } from "lucide-react";
import { useS3Upload } from "@/hooks/useS3Upload"; // Your Hook
import AuroraSubthreadSelector from "@/components/AuroraSubthreadSelector";

function CreatePostContent() {
    const params = useSearchParams();
    const realm = params.get("realm") || "Tech";
    const router = useRouter();

    const { uploadFile, progress, isUploading } = useS3Upload();

    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [selectedSubthread, setSelectedSubthread] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Helper to determine accepted files based on Realm Rules
    const getAcceptType = () => {
        if (realm === "Music") return "audio/*";
        if (realm === "Literature" || realm === "Science") return "application/pdf,image/*";
        if (realm === "Art" || realm === "Photography") return "image/*";
        return "video/*,image/*"; // Tech, Sports, etc.
    };

    const handlePublish = async () => {
        if (!file || !selectedSubthread) return;
        setIsPublishing(true);

        try {
            // 1. UPLOAD TO AWS
            const uploadResult = await uploadFile(file, realm);
            if (!uploadResult) throw new Error("Upload Failed");

            // 2. SAVE TO NEO4J
            const res = await fetch("http://localhost:8000/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    realm,
                    subthread: selectedSubthread,
                    caption,
                    media_url: uploadResult.publicUrl,
                    media_type: file.type.split('/')[0],
                    s3_key: uploadResult.fileKey
                })
            });

            if (res.ok) router.push("/");
            else alert("Backend Error");

        } catch (e) {
            alert("Failed to publish.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 pt-24 pb-12 flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tight mb-1 text-center">New Transmission</h1>
            <p className="text-white/40 text-sm mb-8 font-mono uppercase tracking-widest">Target Sector: {realm}</p>

            {/* 1. FILE UPLOAD */}
            <div className="w-full max-w-md h-64 border border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden bg-white/5 hover:bg-white/10 transition-colors group">
                {file ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
                        {file.type.startsWith("image") && <ImageIcon className="text-cyan-400 mb-2" />}
                        {file.type.startsWith("video") && <Play className="text-cyan-400 mb-2" />}
                        {file.type.startsWith("application") && <FileText className="text-cyan-400 mb-2" />}
                        <div className="z-10 text-center px-4">
                            <div className="text-cyan-400 font-bold text-sm truncate max-w-[200px]">{file.name}</div>
                            <div className="text-[10px] text-white/50 mt-1">Tap to change</div>
                        </div>
                    </div>
                ) : (
                    <>
                        <UploadCloud size={32} className="text-white/30 group-hover:text-cyan-400 transition-colors mb-4" />
                        <span className="text-xs uppercase tracking-widest text-white/30">Upload {realm} Media</span>
                    </>
                )}
                <input type="file" accept={getAcceptType()} className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            {/* 2. SUBTHREAD PICKER */}
            <div className="w-full max-w-md mt-6">
                <button onClick={() => setShowSelector(true)} className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all">
                    <span className={selectedSubthread ? "text-cyan-400 font-bold" : "text-white/30 text-sm"}>
                        {selectedSubthread || "Select Subthread..."}
                    </span>
                    <Hash size={16} className="text-white/30" />
                </button>
            </div>

            {/* 3. CAPTION */}
            <div className="w-full max-w-md mt-4">
                <textarea
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:outline-none focus:border-cyan-500 transition-colors text-sm placeholder:text-white/20"
                    rows={3}
                />
            </div>

            {/* 4. SUBMIT */}
            <button
                disabled={!file || !selectedSubthread || isPublishing}
                onClick={handlePublish}
                className="mt-10 w-full max-w-md py-4 rounded-full bg-white text-black font-black tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
                {isUploading ? `UPLOADING ${progress}%` : isPublishing ? "PUBLISHING..." : "INITIATE"}
            </button>

            {showSelector && (
                <AuroraSubthreadSelector realm={realm} onSelect={setSelectedSubthread} onClose={() => setShowSelector(false)} />
            )}
        </div>
    );
}

export default function CreatePostPage() {
    return <Suspense><CreatePostContent /></Suspense>
}
