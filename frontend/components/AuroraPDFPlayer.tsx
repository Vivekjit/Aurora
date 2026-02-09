"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion } from "framer-motion";

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPlayerProps {
    pdfUrl: string;
    onClose: () => void;
}

export default function AuroraPDFPlayer({ pdfUrl, onClose }: PDFPlayerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // RESET SCROLL POSITION ON OPEN
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, [pdfUrl, numPages]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-black to-black" />

            <div className="relative w-full max-w-2xl h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-4 text-white px-4">
                    <h2 className="font-bold text-lg">Document Preview</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Viewport */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex scrollbar-hide"
                >
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="flex w-full"
                        loading={<div className="text-white m-auto">Loading PDF...</div>}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div
                                key={`page_${index + 1}`}
                                className="min-w-full flex justify-center items-center snap-center px-4"
                            >
                                <div className="relative shadow-2xl">
                                    <Page
                                        pageNumber={index + 1}
                                        height={typeof window !== "undefined" ? window.innerHeight * 0.75 : 600}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="rounded-md overflow-hidden bg-white"
                                    />

                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white/80 text-xs backdrop-blur-sm">
                                        {index + 1} / {numPages}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </motion.div>
    );
}
