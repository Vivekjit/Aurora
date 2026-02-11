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

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar"> 
      <body className="font-sans antialiased no-scrollbar"> 
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
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