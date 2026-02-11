import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
// ✅ NEW IMPORT: Google Auth Provider
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-aurora"
});

export const metadata: Metadata = {
  title: "Aurora",
  description: "Creator OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ SAFETY CHECK: Fallback to prevent crash if .env is missing locally
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en">
      <body className={`${inter.className} ${dancingScript.variable} antialiased`}>
        {/* ✅ WRAPPER 1: Google Auth Provider */}
        <GoogleOAuthProvider clientId={clientId}>
          {/* ✅ WRAPPER 2: Your Theme Provider */}
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}