"use client";

import { FileText } from "lucide-react";

export function PdfViewer({ url }: { url: string }) {
    // Real implementation would use pdfjs-dist or react-pdf
    // For now, we use an object/iframe embed or a placeholder if url is dummy
    return (
        <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <FileText size={120} strokeWidth={1} />
            </div>

            {url && url.endsWith('.pdf') ? (
                <iframe
                    src={url}
                    className="h-full w-full z-10"
                    title="PDF Viewer"
                />
            ) : (
                <div className="z-10 bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
                    <FileText className="mx-auto mb-4 text-slate-500" size={48} />
                    <h3 className="font-semibold text-slate-800 mb-2">PDF Document</h3>
                    <p className="text-slate-500 text-sm mb-4">Preview not available in this demo mode.</p>
                    <div className="text-xs text-slate-400 break-all">{url}</div>
                </div>
            )}
        </div>
    );
}
