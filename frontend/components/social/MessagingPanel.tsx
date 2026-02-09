"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { X, Send, Search } from "lucide-react";

export function MessagingPanel() {
    const { isMessagingOpen, closeMessaging } = useUIStore();

    return (
        <AnimatePresence>
            {isMessagingOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMessaging}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: "100%" }} // Slide in from right as well? Or left? Let's do Right but maybe wider or distinct style.
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
                            <button onClick={closeMessaging} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search DMs..."
                                    className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* Initial Empty State or List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors mb-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-semibold text-slate-800 text-sm">User_{i}</h4>
                                            <span className="text-xs text-slate-400">2m</span>
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">Hey, saw your art post!</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Compose Input Placeholder */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                            Graph-based messaging integration pending API connection.
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
