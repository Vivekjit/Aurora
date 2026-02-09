"use client";

import { BaseCard } from "./BaseCard";
import { ImageCarousel } from "./cards/ImageCarousel";
import { VideoPlayer } from "./cards/VideoPlayer";
import { PdfViewer } from "./cards/PdfViewer";
import { AudioPlayer } from "./cards/AudioPlayer";

// Define the types for our Feed Items
export type MediaType = "image" | "video" | "pdf" | "audio";
export type RealmType = "art" | "tech" | "science" | "literature" | "photography" | "videography" | "music" | "tidbits";

export interface FeedItemData {
    id: string;
    realm: RealmType;
    mediaType: MediaType;
    mediaUrls: string[]; // Can be one or multiple (for carousel)
    title: string;
    description: string;
    author: {
        username: string;
        avatarUrl?: string;
    };
    metrics?: {
        likes: number;
        views: number;
    };
}

export function FeedItem({ item }: { item: FeedItemData }) {

    const renderContent = () => {
        switch (item.realm) {
            case "art":
            case "photography":
                return <ImageCarousel images={item.mediaUrls} />;

            case "videography":
            case "tidbits":
                return <VideoPlayer url={item.mediaUrls[0]} isShort={item.realm === "tidbits"} />;

            case "science":
            case "literature":
            case "tech": // Tech might be PDF or Image? Assuming PDF/Article for now based on requirements, or adaptable.
                // "Science/Literature: PDF viewers and images"
                if (item.mediaType === 'image') return <ImageCarousel images={item.mediaUrls} />;
                return <PdfViewer url={item.mediaUrls[0]} />;

            case "music":
                return <AudioPlayer url={item.mediaUrls[0]} coverArt={item.mediaUrls[1]} />; // Assuming 2nd URL is cover art

            default:
                return <ImageCarousel images={item.mediaUrls} />;
        }
    }

    return (
        <BaseCard className="border-b border-slate-100">
            {renderContent()}

            {/* Overlay Info (Title, Author, etc.) - Positioned Absolute Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white pt-20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white/50" /> {/* Avatar Placeholder */}
                    <span className="font-semibold text-sm">@{item.author.username}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{item.realm}</span>
                </div>
                <h2 className="text-lg font-bold leading-tight mb-1">{item.title}</h2>
                <p className="text-sm opacity-90 line-clamp-2">{item.description}</p>
            </div>
        </BaseCard>
    );
}
