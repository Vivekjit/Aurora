"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "neon-black" | "neon-white";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    glassClass: string;
    textClass: string;
    containerClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("neon-black");

    useEffect(() => {
        const saved = localStorage.getItem("aurora-theme") as Theme;
        if (saved) setTheme(saved);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "neon-black" ? "neon-white" : "neon-black";
        setTheme(newTheme);
        localStorage.setItem("aurora-theme", newTheme);
    };

    // 1. SAFE BACKGROUNDS (Standard Tailwind Colors)
    const containerClass = theme === "neon-black"
        ? "bg-[#050505]" // Deep Void
        : "bg-gradient-to-br from-gray-100 via-blue-50 to-rose-50"; // Holographic Ice (Safe)

    // 2. GLASS PANELS
    const glassClass = theme === "neon-black"
        ? "bg-white/5 border-white/10 shadow-lg text-white"
        : "bg-white/60 backdrop-blur-xl border-white/40 shadow-xl text-slate-900";

    // 3. TEXT COLORS
    const textClass = theme === "neon-black"
        ? "text-white"
        : "text-slate-900";

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, glassClass, textClass, containerClass }}>
            {/* Ensure this div covers the whole screen */}
            <div className={`min-h-screen w-full transition-colors duration-700 ${containerClass}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
