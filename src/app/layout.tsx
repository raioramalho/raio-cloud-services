/* eslint-disable react/no-children-prop */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/layout/side-bar";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-nunito",
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
    <html lang="pt-BR" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen w-full">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange>            
            <Sidebar children={children} />            
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}