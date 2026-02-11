"use client";
import { useState, Suspense, useEffect } from "react"; // ✅ Added useEffect for stable redirect
import { useSearchParams, useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext"; 
import AuroraHeader from "@/components/AuroraHeader";
import AuroraChat from "@/components/AuroraChat";
import AuroraDashboard from "@/components/AuroraDashboard"; 
import AuroraNodeCloud from "@/components/AuroraNodeCloud"; 
import { Compass } from "lucide-react"; // Removed Zap and Loader
import AuroraEditorial from "@/components/AuroraEditorial";


function HomeContent() {
  // --- 1. HOOKS ---
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Identity Params
  const myIdentity = searchParams.get("user") || "Creator";
  const targetIdentity = searchParams.get("target") || "Urja";

  // State Hooks
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  // --- 2. LOGIC CHECKS ---

  // ✅ THE FIX: Move Redirect into useEffect to prevent rendering conflicts
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // ✅ LOADING SCREEN
  if (isLoading) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
      );
  }

  // Prevent content flash during redirect
  if (!user) return null; 

  // --- 3. MAIN UI RETURN ---
  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden no-scrollbar">

      {/* --- LAYER 1: HEADER --- */}
      <AuroraHeader onOpenDashboard={() => setShowDashboard(true)} />

      {/* --- LAYER 2: FEED CONTENT --- */}
      <div className="pt-24 px-4 flex flex-col items-center gap-6 w-full">

        {/* ✅ THE UPGRADED EDITORIAL CMS */}
        <AuroraEditorial/>
        
        {/* ✅ REMOVED: System Operational Button */}
        {/* ✅ REMOVED: Feed Loader & Text */}

      </div>

      {/* --- LAYER 3: PERSISTENT UI --- */}

      {/* Explore Pill */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowExplore(true)}
          className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all group"
        >
          <Compass size={20} className="text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-sm font-bold tracking-widest uppercase">Explore</span>
        </button>
      </div>

      {/* Chat */}
      <div className="relative z-50">
        <AuroraChat myUsername={myIdentity} targetUsername={targetIdentity} />
      </div>

      {/* --- LAYER 4: OVERLAYS --- */}

      {showDashboard && (
        // @ts-ignore 
        <AuroraDashboard isOpen={showDashboard} onClose={() => setShowDashboard(false)} />
      )}

      {showExplore && (
        <AuroraNodeCloud category="Modern Tech" onClose={() => setShowExplore(false)} />
      )}

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

