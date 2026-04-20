import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Caveat } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

// 1. Setup Standard Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: "--font-inter",
});

// 2. Setup the Handwriting Font (The "Wow" Factor)
export const caveat = Caveat({ 
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

// 3. Setup Metadata
export const metadata: Metadata = {
  title: "Cognitive Edu Engine", 
  description: "The Socratic AI that tracks knowledge gaps.",
};

// 4. The Single, Unified RootLayout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider><html
        lang="en"
        // Injecting all our font variables into the HTML tag so Tailwind can use them
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-sans">
        {/* The AuthProvider MUST wrap children to pass session state globally */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}