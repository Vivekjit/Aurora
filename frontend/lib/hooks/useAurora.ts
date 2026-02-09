import { useEffect, useRef, useState } from "react";

export const useAurora = (audioUrl: string | null, imageUrl: string | null) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // State: Only 2 colors now. Default to "Northern Lights" Green/Blue if no image.
    const [colors, setColors] = useState<string[]>(["#0ea5e9", "#10b981"]);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // 1. Dual-Color Extraction Algorithm
    useEffect(() => {
        if (!imageUrl) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Downscale to 20x20 for performance
            canvas.width = 20;
            canvas.height = 20;
            ctx.drawImage(img, 0, 0, 20, 20);
            const data = ctx.getImageData(0, 0, 20, 20).data;

            const rgbToHex = (r: number, g: number, b: number) => {
                return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            };

            // Strategy: 
            // Color 1: Center Pixel (Subject focus)
            // Color 2: Top-Left Pixel (Atmosphere/Background)
            const centerIdx = (10 * 20 + 10) * 4;
            const c1 = rgbToHex(data[centerIdx], data[centerIdx + 1], data[centerIdx + 2]);
            const c2 = rgbToHex(data[0], data[1], data[2]);

            setColors([c1, c2]);
        };
    }, [imageUrl]);

    // 2. Simple Audio Playback (No Analyzer)
    useEffect(() => {
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setDur = () => setDuration(audio.duration);
        const cleanup = () => setCurrentTime(0);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', setDur);
        audio.addEventListener('ended', cleanup);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', setDur);
            audio.removeEventListener('ended', cleanup);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        if (audioRef.current?.paused) audioRef.current.play();
        else audioRef.current?.pause();
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    return { colors, togglePlay, currentTime, duration, seek, audioRef };
};
