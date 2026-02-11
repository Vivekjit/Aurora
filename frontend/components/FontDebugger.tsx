"use client";
import { useEffect, useRef, useState } from 'react';

export default function FontDebugger() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [debugInfo, setDebugInfo] = useState({
    computedFont: "Analyzing...",
    variableValue: "Checking...",
    fontClass: "Checking..."
  });

  useEffect(() => {
    if (textRef.current) {
      const styles = window.getComputedStyle(textRef.current);
      
      // 1. What font is the browser rendering?
      const actualFont = styles.fontFamily;
      
      // 2. Is the CSS variable actually defined on the body?
      const variable = getComputedStyle(document.body).getPropertyValue('--font-mercedes');

      setDebugInfo({
        computedFont: actualFont,
        variableValue: variable || "UNDEFINED (This is the error!)",
        fontClass: textRef.current.className
      });
    }
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[9999] bg-yellow-900/90 border border-yellow-500 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm">
      <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-2">
        ⚠️ Font Diagnostics
      </h3>
      
      {/* TEST TARGET */}
      <div className="bg-white/10 p-2 rounded mb-4">
        <p ref={textRef} className="font-mercedes text-2xl text-white">
          Genesis Chapter 1
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          (This text should be Mercedes)
        </p>
      </div>

      {/* DIAGNOSTICS */}
      <div className="space-y-2 text-xs font-mono text-yellow-100">
        <div>
          <span className="text-gray-400">Computed Family:</span><br/>
          <span className="bg-black/50 px-1 text-white">{debugInfo.computedFont}</span>
        </div>
        
        <div>
          <span className="text-gray-400">CSS Variable (--font-mercedes):</span><br/>
          <span className="bg-black/50 px-1 text-white">{debugInfo.variableValue}</span>
        </div>
      </div>
    </div>
  );
}