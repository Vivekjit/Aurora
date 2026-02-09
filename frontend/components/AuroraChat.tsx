"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Lock, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { encryptMessage, decryptMessage, getSharedKey } from "@/lib/crypto";

interface Message {
    from: string;
    text: string;
    isMe: boolean;
    id: string; // Ensure ID is always a string
    status?: "sending" | "sent" | "error"; // New status field
}

export default function AuroraChat({ myUsername, targetUsername }: { myUsername: string, targetUsername: string }) {
    const { glassClass } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const sharedKey = getSharedKey(myUsername, targetUsername);

    // 1. LOAD HISTORY
    useEffect(() => {
        if (!isOpen) return;
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const res = await fetch(`http://localhost:8000/api/chat/history/${myUsername}/${targetUsername}`);
                const data = await res.json();
                const decryptedHistory = data.map((msg: any, index: number) => ({
                    from: msg.from,
                    text: decryptMessage(msg.content, sharedKey) || "⚠️ Decryption Error",
                    isMe: msg.from === myUsername,
                    id: `hist-${index}`,
                    status: "sent"
                }));
                setMessages(decryptedHistory);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [isOpen, myUsername, targetUsername, sharedKey]);

    // 2. REAL-TIME SOCKET
    useEffect(() => {
        if (!isOpen) return;
        const ws = new WebSocket(`ws://localhost:8000/ws/${myUsername}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // DEDUPLICATION LOGIC:
            // If the message is from ME, we ignore the echo because we already 
            // added it optimistically in sendMessage()
            if (data.from === myUsername) return;

            const decrypted = decryptMessage(data.content, sharedKey);
            setMessages((prev) => [...prev, {
                from: data.from,
                text: decrypted || "⚠️ Decryption Error",
                isMe: false,
                id: `live-${Date.now()}-${Math.random()}`,
                status: "sent"
            }]);
        };

        socketRef.current = ws;
        return () => ws.close();
    }, [isOpen, myUsername, sharedKey]);

    // 3. AUTO SCROLL
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // 4. OPTIMISTIC SEND (The Instant Fix)
    const sendMessage = () => {
        if (!input.trim() || !socketRef.current) return;

        const textToSend = input;
        setInput(""); // Clear input immediately

        // A. OPTIMISTIC UPDATE: Show it immediately!
        const tempId = `temp-${Date.now()}`;
        setMessages((prev) => [...prev, {
            from: myUsername,
            text: textToSend,
            isMe: true,
            id: tempId,
            status: "sending" // You could use this to show a little clock icon
        }]);

        // B. ACTUAL NETWORK SEND
        try {
            const cipherText = encryptMessage(textToSend, sharedKey);
            socketRef.current.send(JSON.stringify({ to: targetUsername, ciphertext: cipherText }));

            // C. Update status to 'sent' (Optional for this MVP, but good practice)
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...msg, status: "sent" } : msg
            ));
        } catch (e) {
            console.error("Send failed", e);
            // Mark as error if needed
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] font-sans">
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-cyan-500 shadow-[0_0_20px_cyan] flex items-center justify-center text-black z-50"
                >
                    <MessageCircle size={24} />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-[350px] h-[500px] rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/10 bg-neutral-900/90 backdrop-blur-xl"
                    >
                        {/* HEADER */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-inner" />
                                <div>
                                    <h3 className="font-bold text-white text-sm tracking-wide">@{targetUsername}</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono tracking-wider">
                                        <Lock size={8} /> E2EE SECURE
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingHistory && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-cyan-500" />
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.5, y: 10, rotate: msg.isMe ? 2 : -2 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm shadow-lg backdrop-blur-xl border border-white/30 text-white font-medium tracking-wide ${msg.isMe
                                                ? "bg-gradient-to-br from-cyan-500/40 to-purple-600/40 rounded-tr-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                                                : "bg-gradient-to-br from-pink-500/40 via-cyan-500/40 to-emerald-400/40 rounded-tl-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                                            }`}
                                    >
                                        {msg.text}
                                    </motion.div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 border-t border-white/10 flex gap-3 bg-black/20">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Encrypted message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white text-sm placeholder:text-white/20"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={sendMessage}
                                className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
