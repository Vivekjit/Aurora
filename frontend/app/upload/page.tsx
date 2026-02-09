"use client";
import { ArrowLeft, Music, Image as ImageIcon, Video, FileText, Camera, Atom, Film, Trophy, Smartphone } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

// UPDATED REALMS CONFIGURATION
const REALMS = [
    { id: "Art", label: "Art", icon: ImageIcon, color: "from-pink-500 to-rose-500", desc: "Digital, Sketches, NFT" },
    { id: "Modern Tech", label: "Tech", icon: Smartphone, color: "from-cyan-500 to-blue-500", desc: "Demos, Code, AI" },
    { id: "Science", label: "Science", icon: Atom, color: "from-emerald-500 to-teal-500", desc: "Papers, Research, Data" },
    { id: "Music", label: "Audio Lab", icon: Music, color: "from-violet-500 to-purple-500", desc: "Beats, Samples, tracks" },
    { id: "Cinematography", label: "Cinematography", icon: Film, color: "from-red-500 to-orange-600", desc: "Shorts, Docs, 4K" },
    { id: "Photography", label: "Lens", icon: Camera, color: "from-amber-500 to-orange-500", desc: "Raw, Portraits, Street" },
    { id: "Literature", label: "Literature", icon: FileText, color: "from-slate-500 to-gray-500", desc: "PDFs, Articles, Blogs" },
    { id: "Sports", label: "Sports", icon: Trophy, color: "from-lime-500 to-green-500", desc: "Highlights, Stats" },
];

export default function UploadPage() {
    const { theme, glassClass, textClass } = useTheme();

    return (
        <div className={`min-h-screen w-full px-6 pt-24 pb-12 flex flex-col ${textClass}`}>

            {/* HEADER */}
            <div className="max-w-2xl mx-auto w-full mb-10">
                <Link href="/" className="inline-flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity mb-6">
                    <ArrowLeft size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">Back to Feed</span>
                </Link>
                <h1 className="text-4xl font-black tracking-tight mb-2">Upload to Realm.</h1>
                <p className="opacity-60 text-sm">Select a domain to begin your transmission.</p>
            </div>

            {/* REALM GRID (Tap & Go) */}
            <div className="max-w-2xl mx-auto w-full grid grid-cols-2 gap-4 pb-20">
                {REALMS.map((realm, index) => (
                    <Link href={`/upload/create?realm=${realm.id}`} key={realm.id} className="block group">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative p-6 rounded-3xl border text-left transition-all duration-300 group-hover:scale-[1.02] group-active:scale-95 ${glassClass}`}
                        >
                            {/* Hover Glow Gradient */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${realm.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                            {/* Icon Box */}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${realm.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <realm.icon size={24} className="text-white" />
                            </div>

                            {/* Text */}
                            <h3 className="text-lg font-bold mb-1 relative z-10">{realm.label}</h3>
                            <p className="text-xs opacity-50 font-medium relative z-10">{realm.desc}</p>

                        </motion.div>
                    </Link>
                ))}
            </div>

        </div>
    );
}
