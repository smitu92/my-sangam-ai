"use client";

import SchemeCard from "./SchemeCard";
import type { ContentBlock, SchemeCardData } from "../lib/formatMessage";

/* ── Props ────────────────────────────────────────────────── */
interface MessageRendererProps {
    blocks: ContentBlock[];
    userInitials: string;
    role: "user" | "assistant";
    onNewChat: (schemeName: string) => void;
    onReference: (schemeName: string) => void;
}

/* ── Text Block Renderer ──────────────────────────────────── */
function TextBlock({ content, role }: { content: string; role: "user" | "assistant" }) {
    if (role === "user") {
        return <p className="text-[15px] text-[#2D2D2D] leading-relaxed">{content}</p>;
    }

    return (
        <div
            className="text-[15px] text-[#2D2D2D] leading-relaxed break-words"
            dangerouslySetInnerHTML={{
                __html: content
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#2D2D2D] font-bold'>$1</strong>")
                    .replace(/\n/g, "<br/>"),
            }}
        />
    );
}

/* ── Schemes Block Renderer ───────────────────────────────── */
function SchemesBlock({
    schemes,
    onNewChat,
    onReference,
}: {
    schemes: SchemeCardData[];
    onNewChat: (schemeName: string) => void;
    onReference: (schemeName: string) => void;
}) {
    return (
        <div className="mt-5">
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 chat-scrollbar">
                {schemes.map((scheme, i) => (
                    <SchemeCard
                        key={i}
                        scheme={scheme}
                        onNewChat={onNewChat}
                        onReference={onReference}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Main Renderer ────────────────────────────────────────── */
export default function MessageRenderer({
    blocks,
    userInitials,
    role,
    onNewChat,
    onReference,
}: MessageRendererProps) {
    if (role === "user") {
        return (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3D4F2F] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {userInitials}
                </div>
                <div className="pt-1.5">
                    {blocks.map((block, i) => (
                        <div key={i}>
                            {block.type === "text" && <TextBlock content={block.content} role="user" />}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            {/* Sparkle avatar */}
            <div className="w-8 h-8 rounded-full bg-[#3D4F2F] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                {blocks.map((block, i) => (
                    <div key={i}>
                        {block.type === "text" && <TextBlock content={block.content} role="assistant" />}
                        {block.type === "schemes" && (
                            <SchemesBlock
                                schemes={block.schemes}
                                onNewChat={onNewChat}
                                onReference={onReference}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
