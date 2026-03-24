"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function ChatbotLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="chatbot-layout">
            {children}
        </div>
    );
}
