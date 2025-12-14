// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// --- NEW IMPORT ---
import { AblyClientProvider } from './AblyClientProvider';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ably Chat Interface", // Enhanced title
    description: "A real-time chat application powered by Ably and Next.js", // Enhanced description
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
                {/* 2. Wrap the children with the AblyClientProvider */}
                <AblyClientProvider>
                    {children}
                </AblyClientProvider>
            </body>
        </html>);
}