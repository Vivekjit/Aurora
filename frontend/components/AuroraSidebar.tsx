"use client";
import { useState } from "react";
import { Home, Compass, Plus, BarChart2, Zap, Settings, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const MENU_ITEMS = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: BarChart2, label: "Growth", href: "/growth" }, // The New Dashboard
    { icon: Zap, label: "Rewards", href: "/rewards" },
];

export default function AuroraSidebar() {
    const [active, setActive] = useState("Home");

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-64 hidden md:flex flex-col z-50">
            {/* --- GLASS CONTAINER --- */}
            <div className="flex-1 rounded-[40px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col p-6 overflow-hidden relative group">

                {/* Ambient Glow (Background) */}
                <div className="absolute top-0 left-0 w-full h-32 bg-cyan-500/20 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-full h-32 bg-purple-500/20 blur-[60px] pointer-events-none" />

                {/* --- LOGO --- */}
                <div className="mb-10 px-4">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        Aurora.
                    </h1>
                    <p className="text-white/40 text-xs font-medium tracking-widest uppercase mt-1 ml-1">
                        Creator OS
                    </p>
                </div>

                {/* --- NAVIGATION PILLS --- */}
                <nav className="flex flex-col gap-3 flex-1">
                    {MENU_ITEMS.map((item) => {
                        const isActive = active === item.label;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setActive(item.label)}
                                className="relative group/btn"
                            >
                                {/* Active Background Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                    />
                                )}

                                <div className={`relative z-10 flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300 ${isActive ? "text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="font-semibold text-sm">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* --- CREATE BUTTON (Floating Gradient) --- */}
                <button className="w-full py-4 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all duration-300 flex items-center justify-center gap-2 mb-8 group/create">
                    <Plus size={24} className="group-hover/create:rotate-90 transition-transform duration-300" />
                    <span>New Drop</span>
                </button>

                {/* --- PROFILE PILL --- */}
                <div className="mt-auto">
                    <div className="p-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 pr-6 hover:bg-white/10 transition cursor-pointer group/profile">
                        {/* Avatar with Status Ring */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 p-[2px]">
                                <img
                                    src="http://localhost:8000/uploads/profiles/aurora_cover.png"
                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover/profile:text-cyan-300 transition">Vivekjit</span>
                            <span className="text-[10px] text-white/40 uppercase font-bold">Lvl 42 Creator</span>
                        </div>
                    </div>
                </div>

            </div>
        </aside>
    );
}
