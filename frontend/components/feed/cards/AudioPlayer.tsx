"use client";

import { Play, Pause, Disc } from "lucide-react";
import { useState, useRef } from "react";

export function AudioPlayer({ url, coverArt }: { url: string; coverArt?: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="h-full w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
            {/* Blurry Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-50 blur-3xl scale-110"
                style={{ backgroundImage: `url(${coverArt || '/placeholder-album.jpg'})` }}
            />

            <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />

            <div className="relative z-10 flex flex-col items-center">
                {/* Album Art */}
                <div className="w-64 h-64 rounded-xl shadow-2xl bg-slate-800 mb-8 overflow-hidden relative group">
                    {coverArt ? (
                        <img src={coverArt} alt="Album Art" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Disc size={64} className="text-slate-600" />
                        </div>
                    )}

                    {/* Rotating Vinyl Effect or overlay? Keeping simple for now */}
                </div>

                {/* Controls */}
                <button
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    );
}
