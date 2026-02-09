"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function VideoPlayer({ url, isShort = false }: { url: string; isShort: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Auto-play usually blocked, so start false
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="relative h-full w-full bg-black">
            <video
                ref={videoRef}
                src={url}
                className="h-full w-full object-cover"
                loop={isShort} // Loop if it's a "Tidbit" (short video)
                playsInline
                onClick={togglePlay}
                muted={isMuted} // Default muted to allow autoplay policies if we want
            />

            {/* Controls Overlay - Only show play button if paused */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white">
                        <Play size={40} fill="currentColor" />
                    </div>
                </div>
            )}

            {/* Mute Toggle */}
            <button
                onClick={toggleMute}
                className="absolute top-24 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md z-20"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>
    );
}
