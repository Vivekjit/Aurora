import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google"; // Keep your imports
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

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
  return (
    <html lang="en">
      {/* REMOVE 'bg-black' FROM HERE if it exists. Keep it clean. */}
      <body className={`${inter.className} ${dancingScript.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
