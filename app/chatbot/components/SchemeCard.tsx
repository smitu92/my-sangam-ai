"use client";

import Link from "next/link";
import type { SchemeCardData } from "../lib/formatMessage";

/* ── Icons ────────────────────────────────────────────────── */

function ChatIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function PinIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
        </svg>
    );
}

function FileIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

/* ── Props ────────────────────────────────────────────────── */
interface SchemeCardProps {
    scheme: SchemeCardData;
    onNewChat: (schemeName: string) => void;
    onReference: (schemeName: string) => void;
    matchLabel?: string;
}

/* ── Category Icon ────────────────────────────────────────── */
function getCategoryIcon(category: string) {
    const cat = (category || "").toLowerCase();
    if (cat.includes("agri") || cat.includes("farm")) return "🌾";
    if (cat.includes("edu") || cat.includes("scholar")) return "🎓";
    if (cat.includes("health")) return "🏥";
    if (cat.includes("business") || cat.includes("enterprise")) return "🚀";
    if (cat.includes("housing")) return "🏠";
    if (cat.includes("finance") || cat.includes("credit")) return "🏦";
    if (cat.includes("women") || cat.includes("girl")) return "👩";
    if (cat.includes("social")) return "🤝";
    return "📋";
}

/* ── Component ────────────────────────────────────────────── */
export default function SchemeCard({ scheme, onNewChat, onReference, matchLabel }: SchemeCardProps) {
    const matchPercent = scheme.score
        ? `${Math.round(scheme.score * 100)}% MATCH`
        : matchLabel || "MATCH";

    return (
        <div className="scheme-card-sangam min-w-[280px] max-w-[300px] bg-[#F0F4EC] border border-[#D4DEC8] rounded-2xl p-5 shrink-0 flex flex-col">
            {/* Header: Icon + Match Badge */}
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D4F2F] flex items-center justify-center text-lg">
                    {getCategoryIcon(scheme.category)}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#3D4F2F]/10 text-[#3D4F2F] border border-[#3D4F2F]/20">
                    {matchPercent}
                </span>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7F5E]">
                    {scheme.level || "Central"} · {scheme.category || "Scheme"}
                </span>
            </div>

            {/* Scheme Name */}
            <h4 className="text-sm font-bold text-[#2D2D2D] mb-1.5 leading-snug line-clamp-2">
                {scheme.scheme_name || "Unnamed Scheme"}
            </h4>

            {/* Description */}
            {scheme.description && (
                <p className="text-xs text-[#6B6B6B] mb-3 leading-relaxed line-clamp-2">
                    {scheme.description}
                </p>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Primary CTA: View Details */}
            {scheme.scheme_id ? (
                <Link
                    href={`/schemes/${scheme.scheme_id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D4F2F] text-white text-xs font-semibold hover:bg-[#4A6335] transition-colors w-full justify-center mb-3"
                >
                    View Details <ArrowIcon />
                </Link>
            ) : (
                <div className="mb-3" />
            )}

            {/* Action Bar: 3-4 icon buttons */}
            <div className="flex items-center gap-1 border-t border-[#D4DEC8] pt-3">
                {/* New Chat */}
                <button
                    onClick={() => onNewChat(scheme.scheme_name)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#6B7F5E] hover:bg-[#3D4F2F]/10 hover:text-[#3D4F2F] transition-colors"
                    title="Start new chat about this scheme"
                >
                    <ChatIcon />
                    <span className="hidden sm:inline">Chat</span>
                </button>

                {/* Reference in current chat */}
                <button
                    onClick={() => onReference(scheme.scheme_name)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#6B7F5E] hover:bg-[#3D4F2F]/10 hover:text-[#3D4F2F] transition-colors"
                    title="Use as reference in current chat"
                >
                    <PinIcon />
                    <span className="hidden sm:inline">Refer</span>
                </button>

                {/* Details page */}
                {scheme.scheme_id && (
                    <Link
                        href={`/schemes/${scheme.scheme_id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#6B7F5E] hover:bg-[#3D4F2F]/10 hover:text-[#3D4F2F] transition-colors"
                        title="View full details page"
                    >
                        <FileIcon />
                        <span className="hidden sm:inline">Details</span>
                    </Link>
                )}

                {/* Official website */}
                {scheme.application_url && (
                    <a
                        href={scheme.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#6B7F5E] hover:bg-[#3D4F2F]/10 hover:text-[#3D4F2F] transition-colors"
                        title="Visit official website"
                    >
                        <GlobeIcon />
                        <span className="hidden sm:inline">Official</span>
                    </a>
                )}
            </div>
        </div>
    );
}
