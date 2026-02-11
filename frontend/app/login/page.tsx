"use client";
import React from "react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
      <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"></div>

      {/* Login Card */}
      <div className="z-10 flex flex-col items-center text-center p-10 rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500">

        {/* Logo */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.5)]"></div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 tracking-tighter">
          Aurora
        </h1>
        <p className="text-gray-400 mb-8 text-sm font-medium tracking-wide">
          THE OPERATING SYSTEM FOR CREATORS
        </p>

        {/* Login Button */}
        <div className="scale-110">
          <GoogleLoginButton />
        </div>

        <p className="mt-8 text-white/20 text-xs uppercase tracking-[0.2em]">
          Secure Access • v1.0
        </p>
      </div>
    </div>
  );
}