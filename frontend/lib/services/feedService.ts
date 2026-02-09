import { api } from "../api";

// Define what a "Post" looks like based on your Backend JSON
export interface FeedItem {
  id: string;
  title: string;
  url: string;
  type: "image" | "video" | "pdf" | "audio";
  realm: string;
  topic: string;
  score: number;
  colors?: string[];
  content_url?: string;
  image_url?: string;
  author?: string;
  timeline?: string | { timestamp: number; colors: string[] }[]; // <--- ALLOW STRING
}

// Function to fetch the feed
export const fetchFeed = async (realms?: string[]): Promise<FeedItem[]> => {
  try {
    // If realms are selected, we send them as query params (e.g., ?realms=Science)
    const params = realms ? { realms } : {};

    const response = await api.get("/feed/mix", { params });
    return response.data;

  } catch (error) {
    console.error("❌ Feed Fetch Error:", error);
    return []; // Return empty list on failure so the app doesn't crash
  }
};