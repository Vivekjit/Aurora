"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

export function ImageCarousel({ images }: { images: string[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

    if (!images || images.length === 0) {
        return <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400">No Images</div>;
    }

    return (
        <div className="relative h-full w-full bg-black">
            {/* Scrollable Container */}
            <div
                ref={containerRef}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
                {images.map((src, index) => (
                    <div key={index} className="flex-shrink-0 h-full w-full snap-center relative flex items-center justify-center">
                        {/* Image */}
                        <img
                            src={src}
                            alt={`Slide ${index}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
                    ))}
                </div>
            )}
        </div>
    );
}
