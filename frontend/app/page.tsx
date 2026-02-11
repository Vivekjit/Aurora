"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext"; 
import AuroraHeader from "@/components/AuroraHeader";
import AuroraChat from "@/components/AuroraChat";
import AuroraDashboard from "@/components/AuroraDashboard"; 
import AuroraNodeCloud from "@/components/AuroraNodeCloud"; 
import { Compass, Zap, Loader } from "lucide-react";

function HomeContent() {
  // --- 1. ALL HOOKS MUST BE AT THE TOP (The Fix) ---
  
  // Auth Hooks
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Search Params Hook
  const searchParams = useSearchParams();
  const myIdentity = searchParams.get("user") || "Creator";
  const targetIdentity = searchParams.get("target") || "Urja";

  // State Hooks (MOVED UP)
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  // --- 2. LOGIC CHECKS (Must be AFTER hooks) ---

  // ✅ LOADING SCREEN
  if (isLoading) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
      );
  }

  // ✅ REDIRECT IF NOT LOGGED IN
  if (!user) {
      router.push("/login");
      return null; 
  }

  // --- 3. MAIN UI RETURN ---
  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden">

      {/* --- LAYER 1: HEADER --- */}
      <AuroraHeader onOpenDashboard={() => setShowDashboard(true)} />

      {/* --- LAYER 2: FEED CONTENT --- */}
      <div className="pt-24 px-4 flex flex-col items-center gap-6">

        {/* Welcome Card */}
        <div className="w-full max-w-md p-6 rounded-[35px] bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-cyan-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-1000" />
          <h2 className="text-3xl font-black tracking-tighter mb-2">Good Afternoon.</h2>
          <p className="text-white/40 text-sm font-medium">Here is your daily creative pulse.</p>
        </div>

        {/* System Status */}
        <button className="w-full max-w-md h-20 rounded-[30px] bg-gradient-to-r from-cyan-500 to-purple-600 p-[1px] active:scale-95 transition-transform">
          <div className="w-full h-full rounded-[29px] bg-black/90 backdrop-blur-xl flex items-center justify-center gap-4">
            <Zap className="text-cyan-400 fill-current" />
            <span className="font-bold tracking-widest uppercase text-sm">System Operational</span>
          </div>
        </button>

        {/* Feed Loader */}
        <div className="text-center mt-12 opacity-30">
          <Loader size={20} className="animate-spin mx-auto mb-4" />
          <p className="text-xs tracking-[0.3em] uppercase">Feed Loading...</p>
        </div>
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