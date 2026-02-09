"use client";

import { useLongPress } from "react-use"; // Or "use-long-press" if react-use doesn't support it directly in the way we want, but react-use has useLongPress
import {
    Palette,
    Cpu,
    FlaskConical,
    BookOpen,
    Camera,
    Video,
    Music,
    Zap,
    X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Realms Configuration
const REALMS = [
    { id: "art", name: "Art", icon: Palette },
    { id: "tech", name: "Tech", icon: Cpu },
    { id: "science", name: "Science", icon: FlaskConical },
    { id: "literature", name: "Literature", icon: BookOpen },
    { id: "photography", name: "Photography", icon: Camera },
    { id: "videography", name: "Videography", icon: Video },
    { id: "music", name: "Music", icon: Music },
    { id: "tidbits", name: "Tidbits", icon: Zap },
];

/* New Imports */
import { MessageCircle, User } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

/* Updated Header Component */
export function Header() {
    const [activeRealm, setActiveRealm] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRealmForModal, setSelectedRealmForModal] = useState<string | null>(null);
    const { openMessaging, openProfile } = useUIStore();

    // Helper for Long Press
    // Note: react-use useLongPress returns handlers.
    const onLongPress = (realmId: string) => {
        setSelectedRealmForModal(realmId);
        setModalOpen(true);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
                {/* Top Bar Wrapper - Pointer events allowed on children */}
                <div className="flex items-start justify-between p-4 pointer-events-auto">
                    {/* Left: Messaging Trigger? Or just Realms in center/scroll */}
                    {/* Let's keep Realms as the main "Header" bar, maybe floating? */}
                    {/* The request said "Header: Display the 8 Parent Realms". */}

                    {/* We'll wrap the realms in a nice container and put social icons on sides? */}
                    {/* Or just put social icons absolutely positioned or in the same flex row. */}

                    <div className="bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-200 flex items-center gap-4 overflow-x-auto no-scrollbar max-w-[80vw] mx-auto">
                        {REALMS.map((realm) => (
                            <RealmIcon
                                key={realm.id}
                                realm={realm}
                                isActive={activeRealm === realm.id}
                                onLongPress={() => onLongPress(realm.id)}
                                onClick={() => setActiveRealm(realm.id)}
                            />
                        ))}
                    </div>

                    {/* Right: Absolute Positioned Social Tools */}
                    <div className="fixed top-4 right-4 flex flex-col gap-3">
                        <button
                            onClick={openMessaging}
                            className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-md text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            <MessageCircle size={24} />
                        </button>
                        <button
                            onClick={openProfile}
                            className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-md text-slate-700 hover:text-purple-600 transition-colors"
                        >
                            <User size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <SubThreadModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                realmId={selectedRealmForModal}
            />
        </>
    );
}

function RealmIcon({ realm, isActive, onLongPress, onClick }: {
    realm: typeof REALMS[0];
    isActive: boolean;
    onLongPress: () => void;
    onClick: () => void;
}) {
    const longPressEvent = useLongPress(onLongPress, {
        isPreventDefault: true,
        delay: 500
    });

    return (
        <button
            {...longPressEvent}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center min-w-[50px] transition-colors",
                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <realm.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium tracking-wide">{realm.name}</span>
        </button>
    )
}

function SubThreadModal({ isOpen, onClose, realmId }: { isOpen: boolean; onClose: () => void; realmId: string | null }) {
    if (!isOpen || !realmId) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="fixed inset-x-4 top-[20%] bottom-[20%] z-[70] bg-white rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                                {realmId} <span className="text-slate-400 text-sm font-normal">Sub-Threads</span>
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                            {/* Placeholder for Node-Link Visualization */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                [ Node-Link Visualization for {realmId} Topics ]
                                {/* Using SVG to draw a dummy tree */}
                                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                                    <circle cx="50%" cy="50%" r="40" fill="currentColor" />
                                    <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="currentColor" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="70%" y2="70%" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="30%" cy="70%" r="20" fill="currentColor" />
                                    <circle cx="70%" cy="70%" r="20" fill="currentColor" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
