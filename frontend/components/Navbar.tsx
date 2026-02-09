"use client";
import { useState } from "react";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import Link from "next/link";
import AuroraPlayer from "./AuroraPlayer";
import AuroraVideoPlayer from "./AuroraVideoPlayer";
import AuroraPDFPlayer from "./AuroraPDFPlayer";

export default function Navbar() {
    const [showAuroraTest, setShowAuroraTest] = useState(false);

    // State to hold the REAL video data fetched from backend
    const [videoTestData, setVideoTestData] = useState<{ url: string, timeline: any[] } | null>(null);

    // State for PDF Test
    const [pdfTestUrl, setPdfTestUrl] = useState<string | null>(null);

    // --- THE SMART FETCH FUNCTION ---
    const handleTestVideo = async () => {
        try {
            console.log("🚀 Fetching real video data...");

            let foundPost = null;
            let timelineData = [];
            let finalUrl = "";

            try {
                // FIX: Add timestamp to prevent caching old "Neuroscience" posts
                const res = await fetch(`http://localhost:8000/api/v1/feed/mix?cache_buster=${Date.now()}`);
                const feed = await res.json();

                // 1. Try to find the Real Video in the Feed
                foundPost = feed.find((p: any) =>
                    p.type === 'video' && p.url && p.url.includes("uploads/")
                );
            } catch (e) {
                console.warn("API Fetch failed, switching to Fallback Mode.");
            }

            if (foundPost) {
                console.log("✅ Found DB Post:", foundPost.title);

                // Parse DB Timeline
                try {
                    timelineData = typeof foundPost.timeline === 'string'
                        ? JSON.parse(foundPost.timeline)
                        : foundPost.timeline;
                } catch (e) { console.error("Parse Error", e); }

                // Construct URL (Handle relative/absolute)
                finalUrl = foundPost.url.startsWith("http")
                    ? foundPost.url
                    : `http://localhost:8000/${foundPost.url}`;

            } else {
                // 2. FALLBACK MODE (If DB search fails, force it to work)
                console.warn("⚠️ Post not found in DB. Using Direct File Fallback.");

                finalUrl = "http://localhost:8000/uploads/videos/test_vid.mp4";

                // Default Timeline so you can still see colors change
                timelineData = [
                    { timestamp: 0, colors: ["#0000ff", "#000000"] },
                    { timestamp: 5, colors: ["#ff0000", "#4a0404"] },
                    { timestamp: 10, colors: ["#00ff00", "#004400"] }
                ];

                alert("Using Fallback Mode: Loading file directly from /uploads/...");
            }

            // 3. Launch Player
            setVideoTestData({
                url: finalUrl,
                timeline: timelineData || []
            });

        } catch (err) {
            console.error("Critical Error:", err);
            alert("Something went wrong. Check console.");
        }
    };

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-6 shadow-2xl">
                <Link href="/" className="p-2 text-white hover:scale-110 transition"><Home size={24} /></Link>
                <Link href="/search" className="p-2 text-white/50 hover:text-white transition"><Search size={24} /></Link>
                <button className="p-2 text-white/50 hover:text-white transition"><PlusSquare size={24} /></button>
                <button className="p-2 text-white/50 hover:text-white transition"><Heart size={24} /></button>
                <Link href="/profile" className="p-2 text-white/50 hover:text-white transition"><User size={24} /></Link>
            </nav>

            {/* --- TEST CONTROLS --- */}
            <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
                <button
                    onClick={() => setShowAuroraTest(true)}
                    className="px-4 py-2 glass-heavy rounded-full text-xs font-bold text-cyan-300 border border-cyan-500/30 shadow-lg hover:scale-105 transition"
                >
                    🎵 Test Audio
                </button>

                {/* This button triggers the Real API Call */}
                <button
                    onClick={handleTestVideo}
                    className="px-4 py-2 glass-heavy rounded-full text-xs font-bold text-pink-300 border border-pink-500/30 shadow-lg hover:scale-105 transition"
                >
                    🎬 Test Video (Real Data)
                </button>

                {/* PDF TEST BUTTON */}
                <button
                    onClick={() => setPdfTestUrl("http://localhost:8000/uploads/pdfs/test.pdf")}
                    className="px-4 py-2 glass-heavy rounded-full text-xs font-bold text-yellow-300 border border-yellow-500/30 shadow-lg hover:scale-105 transition"
                >
                    📄 Test PDF
                </button>
            </div>

            {/* --- PLAYERS --- */}

            {showAuroraTest && (
                <AuroraPlayer
                    audioUrl="http://localhost:8000/uploads/profiles/test_audio.mp3"
                    imageUrl="http://localhost:8000/uploads/profiles/aurora_cover.png"
                    colors={["#0ea5e9", "#8b5cf6"]}
                    onClose={() => setShowAuroraTest(false)}
                />
            )}

            {/* Video Player launches only when we have fetched data */}
            {videoTestData && (
                <AuroraVideoPlayer
                    videoUrl={videoTestData.url}
                    timeline={videoTestData.timeline}
                    onClose={() => setVideoTestData(null)}
                />
            )}

            {/* PDF Player */}
            {pdfTestUrl && (
                <AuroraPDFPlayer
                    pdfUrl={pdfTestUrl}
                    onClose={() => setPdfTestUrl(null)}
                />
            )}
        </>
    );
}
