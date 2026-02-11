import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Camera, X, LogOut, Loader2, Save } from 'lucide-react';

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuroraDashboard = ({ isOpen, onClose }: DashboardProps) => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Edit State
    const [newName, setNewName] = useState("");
    const [previewImg, setPreviewImg] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNewName(user?.username || user?.name || "");
            setPreviewImg(user?.picture || "");
            setIsEditing(false);

            // ✅ THE GENIE ANIMATION (Double RAF Fix)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
        }
    }, [isOpen, user]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 500);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewImg(URL.createObjectURL(file));
        setIsUploading(true);

        try {
            const signRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, file_type: file.type, realm: "Profile" })
            });
            const signData = await signRes.json();
            await fetch(signData.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
            setPreviewImg(signData.public_url);
        } catch (err) { console.error(err); } finally { setIsUploading(false); }
    };

    const saveProfile = async () => {
        if (!user?.email) return;
        setIsUploading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, username: newName, picture: previewImg })
            });
            if (res.ok) window.location.reload();
        } catch (err) { console.error(err); } finally { setIsUploading(false); }
    };

    if (!user) return null;
    const level = user.level || 1;
    const streak = user.streak || 0;
    const impact = user.total_impact || 0;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-in-out ${isVisible ? 'bg-black/60 backdrop-blur-md pointer-events-auto' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`} onClick={handleClose}>
            <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-6 relative shadow-2xl overflow-hidden transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-top-right ${isVisible ? 'scale-100 opacity-100 translate-x-0 translate-y-0 blur-0' : 'scale-0 opacity-0 translate-x-[100px] -translate-y-[100px] blur-xl'}`}>

                <button onClick={handleClose} className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md"><X size={20} /></button>

                <div className="mb-8 flex items-center justify-between pr-12">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic tracking-tighter">Creator OS</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-white font-bold tracking-widest uppercase text-xs">{user.username || user.name.split(' ')[0]} • LVL {level}</span>
                            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-cyan-400 underline">Edit</button>}
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-cyan-500/30 p-1 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 relative shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <img src={previewImg || user.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4 relative overflow-hidden">
                    {isEditing ? (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in py-2">
                            <div className="relative group">
                                <img src={previewImg} className="w-28 h-28 rounded-full border-4 border-[#0a0a0a] outline outline-2 outline-cyan-500 shadow-xl object-cover" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-center text-white w-full" placeholder="Username" />
                            <button onClick={saveProfile} disabled={isUploading} className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2">
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-end mb-2">
                            <div><h3 className="text-white text-lg font-bold font-mono uppercase tracking-wider">Momentum</h3><p className="text-cyan-400/60 text-[10px] font-bold tracking-[0.2em]">LAST 365 DAYS</p></div>
                            <div className="text-right"><span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">{streak}</span><p className="text-white/40 text-[10px] tracking-widest uppercase font-bold mt-1">Streak</p></div>
                        </div>
                    )}
                </div>

                <button onClick={logout} className="w-full py-4 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-3 font-bold tracking-wider text-sm"><LogOut size={18} /> OFFLINE MODE</button>
            </div>
        </div>
    );
};
export default AuroraDashboard;
