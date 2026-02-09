"use client";
import { User, Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link"; // Import Link for navigation

interface HeaderProps {
    onOpenDashboard: () => void;
}

export default function AuroraHeader({ onOpenDashboard }: HeaderProps) {
    const { theme } = useTheme();

    // Adaptive Colors
    const logoColor = theme === "neon-white" ? "text-black" : "text-white";
    const borderColor = theme === "neon-white" ? "border-black/5" : "border-white/10";
    const glassButton = theme === "neon-white"
        ? "bg-black/5 hover:bg-black/10 text-black border-black/10"
        : "bg-white/10 hover:bg-white/20 text-white border-white/10";

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 pointer-events-none transition-colors duration-500 border-b ${borderColor} bg-gradient-to-b from-black/5 to-transparent backdrop-blur-sm`}>

            {/* LEFT: UPLOAD TRIGGER (The "Plus") */}
            <Link href="/upload" className="pointer-events-auto">
                <button
                    className={`group relative w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${glassButton}`}
                >
                    <Plus size={20} className="relative z-10 transition-transform group-hover:rotate-90" />

                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </Link>

            {/* CENTER: LOGO */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
                <h1 className={`relative text-3xl font-black ${logoColor} tracking-tight font-sans cursor-default hover:scale-105 transition-transform duration-500 drop-shadow-2xl`}>
                    <span className="absolute inset-0 blur-md text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 select-none opacity-50">
                        Aurora
                    </span>
                    <span className="relative z-10">
                        Aurora
                    </span>
                </h1>
            </div>

            {/* RIGHT: PROFILE TRIGGER */}
            <button
                onClick={onOpenDashboard}
                className="relative group transition-transform active:scale-95 pointer-events-auto"
            >
                <div className="absolute -inset-[2px] bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-[3px] opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 bg-gray-900">
                    <img
                        src="http://localhost:8000/uploads/profiles/aurora_cover.png"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </button>
        </header>
    );
}