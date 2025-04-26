import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description: "Cloud Services and Solutions",
  title: "Raio Cloud Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full p-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Raio Cloud Services</h1>
        </header>
        <main>
          {children}
        </main>
        <footer className="w-full p-4 bg-gray-800 text-white mt-auto">
          <p className="text-center">© {new Date().getFullYear()} Raio Cloud Services. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}