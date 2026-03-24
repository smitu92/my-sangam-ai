"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChatbot = pathname?.startsWith("/chatbot");

    return (
        <>
            {!isChatbot && <Navbar />}
            <div className="relative w-full overflow-x-hidden">
                {children}
            </div>
            {!isChatbot && <Footer />}
        </>
    );
}
