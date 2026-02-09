"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { X, User, Settings, BatteryCharging } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function ProfileOverlay() {
    const { isProfileOpen, closeProfile } = useUIStore();
    const { user } = useAuthStore();

    return (
        <AnimatePresence>
            {isProfileOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeProfile}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-80 bg-white z-[70] shadow-2xl p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Identity</h2>
                            <button onClick={closeProfile} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-slate-50 shadow-inner">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">@{user?.username || "Guest_User"}</h3>
                            <p className="text-sm text-slate-500">Digital Nomad</p>
                        </div>

                        {/* Stats / Synapse Cred */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500 font-medium">Synapse Cred</span>
                                <BatteryCharging size={18} className="text-green-500" />
                            </div>
                            <div className="text-3xl font-black text-slate-800">{user?.synapse_cred || 8540}</div>
                        </div>

                        {/* Follow details */}
                        <div className="flex justify-between mb-8 px-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-800">248</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-800">102</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Following</div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                                <Settings size={20} />
                                <span>Settings</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
