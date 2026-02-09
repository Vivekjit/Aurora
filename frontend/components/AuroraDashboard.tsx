"use client";
import { X, Zap, Trophy, Settings, LogOut, Star, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GrowthHeatmap from "./GrowthHeatmap";
import { useTheme } from "@/context/ThemeContext"; // Import Theme Hook

interface DashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuroraDashboard({ isOpen, onClose }: DashboardProps) {
    const { theme, toggleTheme, glassClass, textClass } = useTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sliding Drawer */}
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 bottom-0 w-full md:w-[450px] z-50 p-8 overflow-y-auto border-l transition-colors duration-500
              ${theme === "neon-black" ? "bg-[#020202] border-white/10" : "bg-white/90 border-black/5"}`}
                    >
                        {/* Ambient Glows (Adapts to Theme) */}
                        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-cyan-600/20 blur-[120px] pointer-events-none" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tighter">
                                    Creator OS
                                </h2>
                                <p className={`text-xs uppercase tracking-[0.2em] mt-1 font-bold opacity-60 ${textClass}`}>Vivekjit • Lvl 42</p>
                            </div>
                            <button onClick={onClose} className={`p-3 rounded-full hover:rotate-90 transition-all border ${glassClass}`}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* HEATMAP */}
                        <div className="mb-10 relative">
                            <GrowthHeatmap />
                        </div>

                        {/* STATS */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className={`p-5 rounded-3xl border relative overflow-hidden group ${glassClass}`}>
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Zap size={40} />
                                </div>
                                <div className="text-3xl font-black mb-1">12.5k</div>
                                <div className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Total Impact</div>
                            </div>
                            <div className={`p-5 rounded-3xl border relative overflow-hidden group ${glassClass}`}>
                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                    <Trophy size={40} />
                                </div>
                                <div className="text-3xl font-black mb-1">Top 1%</div>
                                <div className="text-[10px] text-purple-500 uppercase tracking-widest font-bold">Global Rank</div>
                            </div>
                        </div>

                        {/* MENU ITEMS (With Toggle) */}
                        <div className="space-y-3">
                            {/* THEME TOGGLE BUTTON */}
                            <button
                                onClick={toggleTheme}
                                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-98 ${glassClass}`}
                            >
                                <div className="flex items-center gap-4">
                                    {theme === "neon-black" ? <Moon size={20} className="text-cyan-400" /> : <Sun size={20} className="text-amber-500" />}
                                    <span className="text-sm font-bold tracking-wide">Appearance</span>
                                </div>
                                <span className="text-xs font-bold uppercase opacity-50">{theme === "neon-black" ? "Neon Dark" : "Neon White"}</span>
                            </button>

                            <button className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all active:scale-98 ${glassClass}`}>
                                <Settings size={20} className="opacity-60" />
                                <span className="text-sm font-bold tracking-wide">Settings</span>
                            </button>

                            <button className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all active:scale-98 ${glassClass}`}>
                                <LogOut size={20} className="text-red-400" />
                                <span className="text-sm font-bold tracking-wide text-red-400">Log Out</span>
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
