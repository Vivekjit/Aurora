"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useSpring } from "framer-motion";
import { X, Hash, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NodeData {
  name: string;
  popularity: number;
}

interface SubthreadSelectorProps {
  realm: string;
  onSelect: (subthread: string) => void;
  onClose: () => void;
}

export default function AuroraSubthreadSelector({ realm, onSelect, onClose }: SubthreadSelectorProps) {
  const { glassClass, theme } = useTheme();
  const containerBorder = theme === "neon-white" ? "border-black/10" : "border-white/20";

  // --- DATA STATE ---
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/subthreads/${realm}`);
        const data = await res.json();
        setNodes(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch subthreads", e);
        setLoading(false);
      }
    };
    fetchData();
  }, [realm]);

  // --- OPTIMIZED ZOOM ---
  const [scale, setScale] = useState(1);
  const smoothScale = useSpring(scale, { stiffness: 200, damping: 20 });

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const newScale = scale - e.deltaY * 0.0005;
    setScale(Math.min(Math.max(newScale, 0.5), 2.0));
  };

  useEffect(() => {
    smoothScale.set(scale);
  }, [scale, smoothScale]);

  // --- MEMOIZED LAYOUT (The 60FPS Logic) ---
  const renderedNodes = useMemo(() => {
    return nodes.map((node, i) => {
      // Offset index by 1 to leave the CENTER empty
      const index = i + 1;

      // Position Math (Phyllotaxis)
      const angle = index * 137.5;
      const toRad = angle * (Math.PI / 180);
      const spacing = 60;
      const radius = spacing * Math.sqrt(index);
      const x = radius * Math.cos(toRad);
      const y = radius * Math.sin(toRad);

      // Sizing
      const sizePx = 50 + ((node.popularity / 100) * 40);

      // Static Styles for Performance
      const nodeStyle = `${glassClass} ${containerBorder} z-0 font-bold opacity-90`;

      return (
        <div
          key={node.name}
          onClick={() => { onSelect(node.name); onClose(); }}
          className={`absolute rounded-full border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-20 hover:opacity-100 active:scale-95 ${nodeStyle}`}
          style={{
            transform: `translate3d(${x}px, ${y}px, 0)`,
            width: sizePx,
            height: sizePx,
            fontSize: Math.max(8, sizePx / 5.5),
            willChange: "transform"
          }}
        >
          {node.popularity > 60 && <Hash size={10} className="opacity-50 mb-0.5" />}
          <span className="text-center leading-none px-1 truncate max-w-[90%] tracking-wider uppercase">
            {node.name}
          </span>
        </div>
      );
    });
  }, [nodes, glassClass, containerBorder, onSelect, onClose]);

  return (
    <>
      {/* 1. BACKDROP BLUR (Click to Close) */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 2. THE GLASS WINDOW (Fixed Size, Centered) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[340px] h-[420px] rounded-[45px] overflow-hidden shadow-2xl flex items-center justify-center border-[1px] ${glassClass} ${containerBorder}`}
        onWheel={handleWheel}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 z-[110] p-2 rounded-full border transition-all active:scale-95 ${glassClass} ${containerBorder} hover:bg-red-500/20 hover:border-red-500/30 group`}
        >
          <X size={16} className="group-hover:text-red-400 transition-colors" />
        </button>

        {/* HEADER */}
        <div className="absolute top-6 left-6 z-[110] pointer-events-none">
          <h2 className="text-sm font-black uppercase tracking-widest opacity-50">Select Thread</h2>
          <h1 className="text-xl font-bold tracking-tight">{realm}</h1>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-white/50">
            <Loader2 className="animate-spin" />
            <span className="text-xs uppercase tracking-widest">Loading Graph...</span>
          </div>
        ) : (
          <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
            {/* DRAGGABLE CANVAS */}
            <motion.div
              drag
              dragConstraints={{ left: -350, right: 350, top: -350, bottom: 350 }}
              dragElastic={0.2}
              style={{
                scale: smoothScale,
                transformPerspective: 1000,
                willChange: "transform"
              }}
              className="absolute left-1/2 top-1/2 w-0 h-0 flex items-center justify-center"
            >
              {renderedNodes}
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
}