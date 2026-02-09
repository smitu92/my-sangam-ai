import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sangam - AI-Powered Scheme Finder",
  description: "Find Government Schemes Tailored for You using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Navbar />
        <div className="relative w-full overflow-x-hidden">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
