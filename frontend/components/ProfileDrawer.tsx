"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, MessageSquare, Bookmark, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { logoutUser, getCurrentUsername } from "@/lib/services/authService";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { name: "Chats", icon: MessageSquare },
    { name: "Creative Dashboard", icon: LayoutDashboard },
    { name: "Saved Posts", icon: Bookmark },
    { name: "Settings", icon: Settings },
];

export default function ProfileDrawer({ isOpen, onClose }: DrawerProps) {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            const username = getCurrentUsername();
            if (username) {
                // Fetch Profile
                api.get(`/profile/${username}`)
                    .then(res => setProfile(res.data))
                    .catch(err => console.error("Profile fetch error", err));
            }
        }
    }, [isOpen]);

    // Helper for image URL
    const getImageUrl = (path: string) => {
        if (!path) return null;
        return `http://localhost:8000/${path}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/10 z-[60] backdrop-blur-[2px]" />

                    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-4 right-4 bottom-4 w-72 glass-liquid rounded-[32px] z-[70] p-6 overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                {/* DYNAMIC PROFILE PICTURE */}
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 overflow-hidden shadow-lg relative">
                                    {profile?.profile_pic_url ? (
                                        <img src={getImageUrl(profile.profile_pic_url)!} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-blue-600" />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight text-white">
                                        {profile ? profile.username : "Guest"}
                                    </h2>
                                    <p className="text-[10px] text-white/50 font-medium">
                                        Cred: {profile ? profile.synapse_cred : 0}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
                                <X size={18} className="text-white/80" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 space-y-3">
                            {menuItems.map((item) => (
                                <button key={item.name} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition text-left group">
                                    <item.icon size={20} className="text-white/80 group-hover:text-cyan-300 transition" />
                                    <span className="text-sm text-white/90 font-medium tracking-wide">{item.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Logout */}
                        <button onClick={logoutUser} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition mt-4">
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
