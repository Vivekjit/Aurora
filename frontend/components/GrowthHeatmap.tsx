"use client";
import { motion } from "framer-motion";

const generateData = () => Array.from({ length: 364 }, () => Math.floor(Math.random() * 5));
const data = generateData();

const getColor = (level: number) => {
    switch (level) {
        case 0: return "bg-white/5";
        case 1: return "bg-cyan-900/30";
        case 2: return "bg-cyan-700/50";
        case 3: return "bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.4)]"; // Cyan Glow
        case 4: return "bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)]"; // Neon Purple (Hot)
        default: return "bg-white/5";
    }
};

export default function GrowthHeatmap() {
    return (
        <div className="w-full p-8 rounded-[30px] bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">

            {/* Header */}
            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-medium tracking-wide text-white mb-1 font-sans">Momentum</h2>
                    <p className="text-white/40 text-xs tracking-wider uppercase">Last 365 Days</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        42
                    </div>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Streak</div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide mask-gradient">
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const intensity = data[weekIndex * 7 + dayIndex] || 0;
                            return (
                                <div
                                    key={dayIndex}
                                    className={`w-2.5 h-2.5 rounded-[2px] ${getColor(intensity)} transition-all duration-300 hover:scale-150 hover:shadow-[0_0_10px_cyan]`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}