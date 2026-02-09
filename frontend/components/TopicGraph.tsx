"use client";
import { motion, AnimatePresence } from "framer-motion";

interface TopicGraphProps {
    isOpen: boolean;
    realm: string | null;
    onClose: () => void;
}

export default function TopicGraph({ isOpen, realm, onClose }: TopicGraphProps) {
    return (
        <AnimatePresence>
            {isOpen && realm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
                >
                    {/* Visual Graph Overlay */}
                    <div className="bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto min-w-[300px] text-center">
                        <h3 className="text-2xl font-bold text-white mb-6">Explore {realm}</h3>

                        {/* Graph Node Visualization (CSS Tree) */}
                        <div className="relative flex justify-center items-center h-40">
                            {/* Central Node */}
                            <div className="absolute z-10 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                {realm}
                            </div>

                            {/* Branch Nodes */}
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: i === 1 ? -80 : 60, x: i === 2 ? -80 : i === 3 ? 80 : 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="absolute w-12 h-12 bg-gray-800 border border-white/20 rounded-full flex items-center justify-center text-[10px] text-gray-300"
                                >
                                    Sub {i}
                                </motion.div>
                            ))}

                            {/* Connector Lines (SVG) */}
                            <svg className="absolute inset-0 w-full h-full stroke-white/20" style={{ overflow: 'visible' }}>
                                <line x1="50%" y1="50%" x2="50%" y2="0%" strokeWidth="2" />
                                <line x1="50%" y1="50%" x2="20%" y2="80%" strokeWidth="2" />
                                <line x1="50%" y1="50%" x2="80%" y2="80%" strokeWidth="2" />
                            </svg>
                        </div>

                        <p className="mt-4 text-xs text-gray-500">Select a sub-thread to dive deeper.</p>
                        <button onClick={onClose} className="mt-6 px-6 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20">Close</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
