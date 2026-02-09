"use client";
import { useState, useRef } from "react";
import { Compass, Cpu, Palette, Music, Atom } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import AuroraNodeCloud from "./AuroraNodeCloud"; // <--- IMPORT NEW COMPONENT

export default function AuroraBottomNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isPressed, setIsPressed] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { theme } = useTheme();

    // Colors
    const idleTextColor = theme === "neon-white" ? "text-slate-900/60" : "text-white/40";
    const idleIconColor = theme === "neon-white" ? "text-slate-900/60" : "text-white/40";
    const glassBg = theme === "neon-white" ? "bg-white/60 border-black/5" : "bg-white/5 border-white/10";

    // Handlers
    const handleStart = () => {
        setIsPressed(true);
        timerRef.current = setTimeout(() => {
            setIsOpen(true);
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleEnd = () => {
        setIsPressed(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleCategoryStart = (label: string) => {
        timerRef.current = setTimeout(() => {
            setIsOpen(false); // Close parent dock
            setActiveCategory(label); // Open Cloud
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const categories = [
        { label: "Tech", icon: Cpu, color: "text-cyan-400", bg: "group-hover:bg-cyan-400/20", border: "border-cyan-500/30" },
        { label: "Art", icon: Palette, color: "text-pink-400", bg: "group-hover:bg-pink-400/20", border: "border-pink-500/30" },
        { label: "Music", icon: Music, color: "text-purple-400", bg: "group-hover:bg-purple-400/20", border: "border-purple-500/30" },
        { label: "Science", icon: Atom, color: "text-emerald-400", bg: "group-hover:bg-emerald-400/20", border: "border-emerald-500/30" },
    ];

    return (
        <>
            {/* --- LEVEL 2: APPLE WATCH CLOUD --- */}
            <AnimatePresence>
                {activeCategory && (
                    <AuroraNodeCloud
                        category={activeCategory}
                        onClose={() => setActiveCategory(null)}
                    />
                )}
            </AnimatePresence>

            {/* --- LEVEL 1: RECTANGULAR DOCK --- */}
            <AnimatePresence>
                {isOpen && !activeCategory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-3 rounded-3xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat.label}
                                    // Long Press for Cloud
                                    onMouseDown={() => handleCategoryStart(cat.label)}
                                    onMouseUp={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
                                    onTouchStart={() => handleCategoryStart(cat.label)}
                                    onTouchEnd={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
                                    className={`group relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${cat.bg} hover:scale-105 border border-transparent hover:${cat.border}`}
                                >
                                    <cat.icon size={24} className={`${cat.color} transition-transform group-hover:-translate-y-1 drop-shadow-lg`} />
                                    <span className="absolute bottom-2 text-[10px] font-bold text-white/40 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        {cat.label}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- EXPLORE PILL --- */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 select-none">
                <motion.button
                    onMouseDown={handleStart}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchEnd={handleEnd}
                    whileTap={{ scale: 0.95 }}
                    className={`relative group flex items-center gap-3 px-8 py-3 rounded-full backdrop-blur-md overflow-hidden shadow-lg transition-all duration-500 ${glassBg}`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 transition-opacity duration-300 ${isPressed ? "opacity-100" : "opacity-0"}`} />
                    <div className={`absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl transition-opacity duration-300 ${isPressed ? "opacity-40" : "opacity-0"}`} />

                    <Compass size={20} className={`relative z-10 transition-colors duration-300 ${isPressed ? "text-white" : idleIconColor}`} />
                    <span className={`relative z-10 text-sm font-black tracking-[0.25em] transition-colors duration-300 font-sans ${isPressed ? "text-white" : idleTextColor}`}>
                        EXPLORE
                    </span>
                </motion.button>
            </div>
        </>
    );
}