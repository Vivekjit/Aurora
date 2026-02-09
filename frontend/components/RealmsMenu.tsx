"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Cpu, FlaskConical, BookOpen, Camera, Video, Music, Sparkles } from "lucide-react";
import useLongPress from "@/lib/hooks/useLongPress";

interface RealmsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (realm: string) => void;
    onLongPressRealm: (realm: string) => void; // New Prop
}

const realms = [
    { name: "Art", icon: Palette },
    { name: "Tech", icon: Cpu },
    { name: "Science", icon: FlaskConical },
    { name: "Literature", icon: BookOpen },
    { name: "Photo", icon: Camera },
    { name: "Video", icon: Video },
    { name: "Music", icon: Music },
    { name: "Tidbits", icon: Sparkles },
];

export default function RealmsMenu({ isOpen, onClose, onSelect, onLongPressRealm }: RealmsMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. Backdrop: PURE BLACK FADE only. NO BLUR here. */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[80] bg-black/80"
                    />

                    {/* 2. The Menu: Blur is ISOLATED here via .glass-heavy */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] glass-heavy rounded-[40px] p-6 z-[90]"
                    >
                        {/* Handle Bar */}
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                        <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                            {realms.map((realm) => (
                                <RealmItem
                                    key={realm.name}
                                    realm={realm}
                                    onSelect={() => { onSelect(realm.name); onClose(); }}
                                    onLongPress={() => { onClose(); onLongPressRealm(realm.name); }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Sub-component to handle hooks per item
function RealmItem({ realm, onSelect, onLongPress }: any) {
    const bind = useLongPress(onLongPress, onSelect, { delay: 500 });

    return (
        <button
            {...bind}
            className="flex flex-col items-center gap-3 group active:scale-90 transition-transform"
        >
            <div className="w-14 h-14 rounded-[20px] glass-icon-btn flex items-center justify-center relative overflow-hidden">
                {/* Subtle inner gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <realm.icon
                    strokeWidth={1.5}
                    size={24}
                    className="text-gray-400 group-hover:text-white transition-colors duration-300 relative z-10"
                />
            </div>
            <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200 tracking-wide">
                {realm.name}
            </span>
        </button>
    );
}
