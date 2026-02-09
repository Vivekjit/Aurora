"use client";
import { useState, useRef } from "react";
import { X, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineSegment {
    timestamp: number;
    top: string[];
    bottom: string[];
}

interface VideoPlayerProps {
    videoUrl: string;
    timeline?: TimelineSegment[];
    onClose: () => void;
}

export default function AuroraVideoPlayer({ videoUrl, timeline, onClose }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPortrait, setIsPortrait] = useState(false);

    // State for Spatial Colors
    const [topColors, setTopColors] = useState<string[]>(["#000000", "#000000"]);
    const [bottomColors, setBottomColors] = useState<string[]>(["#000000", "#000000"]);

    const handleMetadata = () => {
        if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            setIsPortrait(videoHeight > videoWidth);
            if (timeline && timeline.length > 0) {
                setTopColors(timeline[0].top);
                setBottomColors(timeline[0].bottom);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const t = videoRef.current.currentTime;
        const d = videoRef.current.duration;
        setProgress((t / d) * 100);

        // SMOOTHING LOGIC:
        // We update the target colors exactly when we cross the timestamp.
        // The CSS 'transition-duration' handles the 5-second blend automatically.
        if (timeline) {
            // Find the segment we are CURRENTLY in
            let currentSegment = timeline[0];
            for (let i = 0; i < timeline.length; i++) {
                if (t >= timeline[i].timestamp) {
                    currentSegment = timeline[i];
                } else {
                    break;
                }
            }

            // Update state (React will diff this, and CSS will transition it)
            if (currentSegment.top && currentSegment.bottom) {
                setTopColors(currentSegment.top);
                setBottomColors(currentSegment.bottom);
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
        >
            {/* --- SPATIAL AURORA ENGINE (Screensaver Mode) --- */}
            {!isPortrait && (
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* KEY CHANGES FOR SMOOTHNESS:
              1. duration-[5000ms]: Matches your 5s data update interval perfectly.
              2. ease-linear: Removes the "slow down" at the end. Constant motion.
              3. opacity-80: Increased visibility for better glow.
           */}

                    {/* Top Left - Sky 1 */}
                    <div
                        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] opacity-80 blur-[100px] will-change-[background-color] transition-colors duration-[5500ms] ease-linear"
                        style={{ background: topColors[0] }}
                    />

                    {/* Top Right - Sky 2 */}
                    <div
                        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] opacity-80 blur-[100px] will-change-[background-color] transition-colors duration-[5500ms] ease-linear"
                        style={{ background: topColors[1] }}
                    />

                    {/* Bottom Left - Ground 1 */}
                    <div
                        className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] opacity-80 blur-[100px] will-change-[background-color] transition-colors duration-[5500ms] ease-linear"
                        style={{ background: bottomColors[0] }}
                    />

                    {/* Bottom Right - Ground 2 */}
                    <div
                        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] opacity-80 blur-[100px] will-change-[background-color] transition-colors duration-[5500ms] ease-linear"
                        style={{ background: bottomColors[1] }}
                    />

                    {/* Black Overlay to keep text/video legible */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[20px]" />
                </div>
            )}

            {/* --- VIDEO CONTAINER --- */}
            <div className={`relative z-10 transition-all duration-500 ${isPortrait ? "w-full h-full" : "w-full max-w-6xl aspect-video shadow-2xl rounded-2xl overflow-hidden border border-white/10"}`}>
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className={`w-full h-full ${isPortrait ? "object-cover" : "object-contain bg-transparent"}`}
                    onLoadedMetadata={handleMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onClick={togglePlay}
                    playsInline
                />

                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-8 group">
                    <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden cursor-pointer">
                        <div className="h-full bg-white shadow-[0_0_10px_white] transition-all ease-linear" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={togglePlay} className="p-4 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition active:scale-95">
                            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
                        </button>
                        <button onClick={onClose} className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition active:scale-95 border border-white/10">
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
