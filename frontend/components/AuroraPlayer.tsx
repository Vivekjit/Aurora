"use client";
import { Play, Pause, X, SkipBack, SkipForward } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Pre-defined animations in Tailwind config or inline styles
// We use inline styles for dynamic colors
interface PlayerProps {
    audioUrl: string;
    imageUrl: string;
    colors: string[]; // <--- NEW: colors passed directly!
    onClose: () => void;
    title?: string;
    artist?: string;
}

export default function AuroraPlayer({ audioUrl, imageUrl, colors, onClose, title = "Aurora Dreams", artist = "Unknown Artist" }: PlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fallback colors if metadata is missing
    const primary = colors?.[0] || "#0ea5e9";
    const secondary = colors?.[1] || "#8b5cf6";

    // Simple Audio Logic
    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const update = () => setProgress((audio.currentTime / audio.duration) * 100);
        audio.addEventListener("timeupdate", update);
        audio.addEventListener("ended", () => setIsPlaying(false));

        return () => {
            audio.pause();
            audio.removeEventListener("timeupdate", update);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        if (audioRef.current?.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const seek = (val: number) => {
        if (audioRef.current) {
            const time = (val / 100) * audioRef.current.duration;
            audioRef.current.currentTime = time;
            setProgress(val);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black overflow-hidden font-sans">

            {/* --- CSS-ONLY AURORA ENGINE (GPU Accelerated) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">

                {/* Layer 1: Primary Color (Clockwise Drift) */}
                <div
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-60 mix-blend-screen animate-spin-slow"
                    style={{
                        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${primary} 120deg, transparent 360deg)`,
                        filter: "blur(80px)",
                        animationDuration: "20s"
                    }}
                />

                {/* Layer 2: Secondary Color (Counter-Clockwise Drift) */}
                <div
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-50 mix-blend-screen animate-spin-reverse-slow"
                    style={{
                        background: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, ${secondary} 120deg, transparent 360deg)`,
                        filter: "blur(100px)",
                        animationDuration: "25s"
                    }}
                />

                {/* Layer 3: Vertical Curtains */}
                <div
                    className="absolute inset-0 opacity-30 animate-wave"
                    style={{
                        background: `linear-gradient(to right, transparent, ${primary}, transparent, ${secondary}, transparent)`,
                        filter: "blur(60px)",
                        transform: "scaleX(2)"
                    }}
                />
            </div>

            {/* --- UI --- */}
            <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center">

                {/* Artwork */}
                {/* --- Album Art Container --- */}
                <div className="relative mb-12">

                    {/* THE BREATHING GLOW AURA (New Layer behind image) */}
                    <div
                        className="absolute -inset-4 rounded-[45px] animate-aurora-breathe transition-all"
                        style={{
                            /* Create a gradient using White -> Primary -> Secondary */
                            background: `linear-gradient(135deg, white, ${primary}, ${secondary})`
                        }}
                    />

                    {/* The Actual Album Image Container */}
                    <div className={`relative z-10 w-72 h-72 rounded-[40px] shadow-2xl overflow-hidden border border-white/20 transition-transform duration-700 ${isPlaying ? "scale-105" : "scale-100"}`}>
                        <img src={imageUrl} className="w-full h-full object-cover" />

                        {/* Optional: Subtle inner reflective sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 pointer-events-none" />
                    </div>

                </div>

                {/* Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-white/50 text-sm tracking-widest uppercase">{artist}</p>
                </div>

                {/* Scrubber */}
                <input
                    type="range"
                    value={progress || 0}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer mb-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />

                {/* Controls */}
                <div className="flex items-center gap-12">
                    <SkipBack className="text-white/60 hover:text-white" size={32} />
                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    >
                        {isPlaying ? <Pause fill="black" size={32} /> : <Play fill="black" size={32} className="ml-1" />}
                    </button>
                    <SkipForward className="text-white/60 hover:text-white" size={32} />
                </div>

                <button onClick={onClose} className="mt-16 text-xs font-bold text-white/30 hover:text-white tracking-widest uppercase">
                    Close Player
                </button>
            </div>
        </div>
    );
}
