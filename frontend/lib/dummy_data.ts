import { FeedItemData } from "@/components/feed/FeedItem";

export const DUMMY_FEED: FeedItemData[] = [
    {
        id: "1",
        realm: "art",
        mediaType: "image",
        mediaUrls: [
            "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2940&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2160&auto=format&fit=crop"
        ],
        title: "Abstract Emotions",
        description: "A series exploring color and texture in modern abstract expressionism.",
        author: { username: "artistic_soul", avatarUrl: "" },
        metrics: { likes: 1240, views: 5000 }
    },
    {
        id: "2",
        realm: "videography",
        mediaType: "video",
        mediaUrls: ["https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"],
        title: "Blooming Flowers",
        description: "Time lapse of flowers blooming in spring.",
        author: { username: "nature_lens", avatarUrl: "" },
        metrics: { likes: 3200, views: 12000 }
    },
    {
        id: "3",
        realm: "music",
        mediaType: "audio",
        mediaUrls: ["https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2940&auto=format&fit=crop"],
        title: "Elephant Walk",
        description: "Classic tunes for the soul. Listen and relax.",
        author: { username: "music_vibes", avatarUrl: "" },
        metrics: { likes: 800, views: 2500 }
    },
    {
        id: "4",
        realm: "science",
        mediaType: "pdf",
        mediaUrls: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"], // Dummy PDF
        title: "Quantum Mechanics Intro",
        description: "A brief introduction to the principles of quantum mechanics.",
        author: { username: "physics_lab", avatarUrl: "" },
        metrics: { likes: 4500, views: 9000 }
    },
    {
        id: "5",
        realm: "photography",
        mediaType: "image",
        mediaUrls: ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop"],
        title: "Mountain Peaks",
        description: "The serenity of high altitude landscapes.",
        author: { username: "traveler_joe", avatarUrl: "" },
        metrics: { likes: 2100, views: 7500 }
    }
];
