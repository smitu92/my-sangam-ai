"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

import ProcessingIndicator from "./components/ProcessingIndicator";
import MessageRenderer from "./components/MessageRenderer";
import { formatAssistantMessage, type ContentBlock, type SchemeCardData } from "./lib/formatMessage";

/* ── Types ────────────────────────────────────────────────── */
interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    blocks: ContentBlock[];
    responseType?: "SCHEME" | "GENERAL" | "OFF_TOPIC";
    schemesFound?: SchemeCardData[];
    createdAt?: string;
}

interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    _count?: { messages: number };
}

/* ── Build user profile string ────────────────────────────── */
function buildUserProfile(user: any): string {
    if (!user) return "Anonymous user";
    const parts: string[] = [];
    if (user.name) parts.push(`Name: ${user.name}`);
    if (user.gender) parts.push(`Gender: ${user.gender}`);
    if (user.state) parts.push(`State: ${user.state}`);
    if (user.caste) parts.push(`Category: ${user.caste}`);
    if (user.occupation) parts.push(`Occupation: ${user.occupation}`);
    if (user.annualIncome) parts.push(`Annual Income: ${user.annualIncome}`);
    return parts.length > 0 ? parts.join(", ") : "No profile info available";
}

/* ── Page Component ───────────────────────────────────────── */
export default function ChatbotPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Chat state
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(true);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Sidebar Initialization Effect
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setSidebarOpen(true);
        }
    }, []);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* ── Auth gate ────────────────────────────────────────── */
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    /* ── Load sessions ────────────────────────────────────── */
    const loadSessions = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/chat/sessions`, {
                headers: { "x-user-id": user.userId },
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            setSessionLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    /* ── Load messages for active session ─────────────────── */
    const loadMessages = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`/api/chat/sessions/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(
                    data.session.messages.map((m: any) => {
                        const schemesFound = m.schemesFound || [];
                        const responseType = schemesFound.length > 0 ? "SCHEME" : "GENERAL";
                        const blocks: ContentBlock[] =
                            m.role === "user"
                                ? [{ type: "text" as const, content: m.content }]
                                : formatAssistantMessage(m.content, responseType, schemesFound);
                        return {
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            blocks,
                            responseType,
                            schemesFound,
                            createdAt: m.createdAt,
                        };
                    })
                );
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    }, []);

    useEffect(() => {
        if (activeSessionId) {
            loadMessages(activeSessionId);
        } else {
            setMessages([]);
        }
    }, [activeSessionId, loadMessages]);

    /* ── Scroll to bottom ─────────────────────────────────── */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    /* ── Auto-resize textarea ─────────────────────────────── */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
        }
    }, [input]);

    /* ── New Chat ─────────────────────────────────────────── */
    const handleNewChat = async (prefill?: string) => {
        if (!user) return;
        try {
            const res = await fetch("/api/chat/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId }),
            });
            if (res.ok) {
                const data = await res.json();
                setSessions((prev) => [data.session, ...prev]);
                setActiveSessionId(data.session.id);
                setMessages([]);
                if (prefill) {
                    setInput(prefill);
                    setTimeout(() => textareaRef.current?.focus(), 100);
                }
                if (window.innerWidth < 768) setSidebarOpen(false);
            }
        } catch (error) {
            console.error("Failed to create session:", error);
        }
    };

    /* ── Send Message ─────────────────────────────────────── */
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading || !user) return;

        let sessionId = activeSessionId;

        // Auto-create session if none active
        if (!sessionId) {
            try {
                const res = await fetch("/api/chat/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.userId }),
                });
                if (res.ok) {
                    const data = await res.json();
                    sessionId = data.session.id;
                    setSessions((prev) => [data.session, ...prev]);
                    setActiveSessionId(sessionId);
                }
            } catch {
                return;
            }
        }

        const userMessage: Message = {
            role: "user",
            content: input,
            blocks: [{ type: "text", content: input }],
        };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const chatHistory = messages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    question: currentInput,
                    user_profile: buildUserProfile(user),
                    chat_history: chatHistory,
                }),
            });

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);

            const data = await response.json();

            const answer = data.answer || "I couldn't find a relevant answer. Try rephrasing your question.";
            const responseType = data.type || "GENERAL";
            const schemesFound = data.schemes_found || [];
            const blocks = formatAssistantMessage(answer, responseType, schemesFound);

            const assistantMsg: Message = {
                role: "assistant",
                content: answer,
                blocks,
                responseType,
                schemesFound,
            };

            setMessages((prev) => [...prev, assistantMsg]);

            // Update session title
            setSessions((prev) =>
                prev.map((s) =>
                    s.id === sessionId
                        ? {
                            ...s,
                            title:
                                s.title === "New Chat"
                                    ? currentInput.slice(0, 50) + (currentInput.length > 50 ? "…" : "")
                                    : s.title,
                            updatedAt: new Date().toISOString(),
                        }
                        : s
                )
            );
        } catch (error) {
            console.error("Chat error:", error);
            const errorContent = "⚠️ Could not reach the AI backend. Make sure FastAPI is running on localhost:8000.";
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: errorContent,
                    blocks: [{ type: "text", content: errorContent }],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    /* ── Scheme Card Action: New Chat ─────────────────────── */
    const handleSchemeNewChat = (schemeName: string) => {
        handleNewChat(`Tell me more about ${schemeName} — eligibility, benefits, and how to apply.`);
    };

    /* ── Scheme Card Action: Reference ────────────────────── */
    const handleSchemeReference = (schemeName: string) => {
        setInput((prev) => (prev ? `${prev}\n\nRegarding ${schemeName}: ` : `Regarding ${schemeName}: `));
        textareaRef.current?.focus();
    };

    /* ── Quick Action handler ─────────────────────────────── */
    const handleQuickAction = (action: string) => {
        setInput(action);
        textareaRef.current?.focus();
    };

    /* ── Keyboard handler ─────────────────────────────────── */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    /* ── Delete Session ───────────────────────────────────── */
    const handleDeleteSession = async (sessionId: string) => {
        try {
            await fetch(`/api/chat/sessions/${sessionId}`, { method: "DELETE" });
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    /* ── Rename Session ───────────────────────────────────── */
    const handleRenameSession = async (sessionId: string) => {
        if (!editTitle.trim()) return;
        try {
            await fetch(`/api/chat/sessions/${sessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle }),
            });
            setSessions((prev) =>
                prev.map((s) => (s.id === sessionId ? { ...s, title: editTitle } : s))
            );
            setEditingSessionId(null);
        } catch (error) {
            console.error("Failed to rename session:", error);
        }
    };

    /* ── Loading state ────────────────────────────────────── */
    if (authLoading) {
        return (
            <div className="h-screen bg-[#FAF7F2] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#D4DEC8] border-t-[#3D4F2F] rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const userInitials = user.name ? user.name.split(" ").map((n: string) => n.charAt(0)).join("").toUpperCase().slice(0, 2) : "U";

    /* ── Render ───────────────────────────────────────────── */
    return (
        <div className="sangam-chat h-screen bg-[#FAF7F2] flex overflow-hidden font-sans">
            {/* ══════════ Mobile Overlay Backdrop ══════════ */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ══════════ Sidebar ══════════ */}
            <aside
                className={`
                    ${sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 md:w-0"} 
                    fixed md:relative z-50 md:z-auto h-full
                    transition-all duration-300 ease-in-out bg-[#FAF7F2] border-r border-[#E5DFD5] 
                    flex flex-col overflow-hidden shrink-0
                `}
            >
                {/* Sidebar Header — Branding */}
                <div className="p-5 border-b border-[#E5DFD5]">
                    <div className="mb-4">
                        <h1 className="text-xl font-serif italic text-[#2D2D2D] font-semibold tracking-tight">Sangam AI</h1>
                        <p className="text-[11px] text-[#9B9B9B] tracking-wide mt-0.5">The Digital Archivist</p>
                    </div>
                    <button
                        onClick={() => handleNewChat()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#F0F4EC] border border-[#E5DFD5] hover:border-[#D4DEC8] transition-all group"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7F5E] group-hover:text-[#3D4F2F] transition-colors">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span className="text-sm font-medium text-[#6B6B6B] group-hover:text-[#3D4F2F] transition-colors">New Chat</span>
                    </button>
                </div>

                {/* Recent History */}
                <div className="px-5 pt-4 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9B9B9B]">Recent History</p>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 chat-scrollbar">
                    {sessionLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-5 h-5 border-2 border-[#D4DEC8] border-t-[#3D4F2F] rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-2xl mb-2">💬</div>
                            <p className="text-sm text-[#9B9B9B]">No conversations yet</p>
                            <p className="text-xs text-[#C5C5C5] mt-1">Start a new chat to begin</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group relative rounded-lg transition-all ${activeSessionId === session.id
                                    ? "bg-[#EEF2E8] border border-[#D4DEC8]"
                                    : "hover:bg-[#F2EDE4] border border-transparent"
                                    }`}
                            >
                                {editingSessionId === session.id ? (
                                    <div className="p-2">
                                        <input
                                            autoFocus
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleRenameSession(session.id);
                                                if (e.key === "Escape") setEditingSessionId(null);
                                            }}
                                            onBlur={() => handleRenameSession(session.id)}
                                            className="w-full bg-white border border-[#D4DEC8] rounded-lg px-3 py-2 text-sm text-[#2D2D2D] outline-none focus:border-[#3D4F2F] focus:ring-1 focus:ring-[#3D4F2F]/20"
                                        />
                                    </div>
                                ) : deleteConfirm === session.id ? (
                                    <div className="p-3 space-y-2">
                                        <p className="text-xs text-[#6B6B6B]">Delete this chat?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-[#F2EDE4] text-[#6B6B6B] hover:bg-[#E5DFD5] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setActiveSessionId(session.id);
                                            if (window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-start gap-3 cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                setActiveSessionId(session.id);
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`mt-0.5 shrink-0 ${activeSessionId === session.id ? "text-[#3D4F2F]" : "text-[#9B9B9B]"}`}>
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                                            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
                                            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
                                        </svg>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm truncate ${activeSessionId === session.id ? "text-[#2D2D2D] font-semibold" : "text-[#6B6B6B]"}`}>{session.title}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSessionId(session.id);
                                                    setEditTitle(session.title);
                                                }}
                                                className="p-1 rounded hover:bg-[#D4DEC8] transition-colors"
                                                title="Rename"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6B7F5E]">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(session.id);
                                                }}
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9B9B9B] hover:text-red-500">
                                                    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#E5DFD5]">
                    <Link href="/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F2EDE4] transition-colors mb-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6B6B6B]">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm text-[#6B6B6B]">Settings</span>
                    </Link>
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-[#3D4F2F] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {userInitials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[#2D2D2D] truncate">{user.name}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══════════ Main Chat Area ══════════ */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Chat Header ────────────────────────────── */}
                <header className="h-14 border-b border-[#E5DFD5] flex items-center justify-between px-5 shrink-0 bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-[#F2EDE4] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B6B6B]">
                                {sidebarOpen ? (
                                    <>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="9" y1="3" x2="9" y2="21" />
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </>
                                )}
                            </svg>
                        </button>
                        <h1 className="text-base font-semibold text-[#2D2D2D]">Sangam AI</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-[#F2EDE4] transition-colors hidden sm:block" title="Help">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6B6B6B]">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[#F2EDE4] transition-colors hidden sm:block" title="Settings">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6B6B6B]">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <Link href="/profile" className="p-1.5 rounded-lg hover:bg-[#F2EDE4] transition-colors ml-1">
                            <div className="w-7 h-7 rounded-full bg-[#3D4F2F] flex items-center justify-center text-[10px] font-bold text-white">
                                {userInitials}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* ── Messages Area ──────────────────────────── */}
                <div className="flex-1 overflow-y-auto chat-scrollbar bg-[#FAF7F2]">
                    <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
                        {/* Welcome */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                                <div className="w-16 h-16 rounded-2xl bg-[#3D4F2F] flex items-center justify-center mb-6 shadow-lg shadow-[#3D4F2F]/15">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Sangam AI Assistant</h2>
                                <p className="text-[#9B9B9B] text-center max-w-md mb-8">
                                    Your intelligent guide to Indian government schemes. Ask me anything about eligibility, benefits, or how to apply.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                    {[
                                        "Show me schemes for farmers in Maharashtra",
                                        "Am I eligible for PM Kisan Yojana?",
                                        "Education scholarships for SC students",
                                        "How to apply for Mudra Loan?",
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInput(suggestion);
                                                textareaRef.current?.focus();
                                            }}
                                            className="text-left text-sm p-4 rounded-xl bg-white border border-[#E5DFD5] text-[#6B6B6B] hover:bg-[#F0F4EC] hover:border-[#D4DEC8] hover:text-[#3D4F2F] transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages — rendered via MessageRenderer */}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className="chatMsg"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <MessageRenderer
                                    blocks={msg.blocks}
                                    userInitials={userInitials}
                                    role={msg.role}
                                    onNewChat={handleSchemeNewChat}
                                    onReference={handleSchemeReference}
                                />
                            </div>
                        ))}

                        {/* Processing Animation */}
                        <ProcessingIndicator loading={loading} />

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* ── Input Area ─────────────────────────────── */}
                <div className="border-t border-[#E5DFD5] p-4 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex items-end gap-3 bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-2 focus-within:border-[#D4DEC8] focus-within:ring-2 focus-within:ring-[#3D4F2F]/10 transition-all">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Sangam AI about eligibility or scheme details..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-sm text-[#2D2D2D] placeholder-[#9B9B9B] px-3 py-2.5 resize-none outline-none overflow-hidden"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="p-2.5 rounded-xl bg-[#3D4F2F] hover:bg-[#4A6335] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="19" x2="12" y2="5" />
                                            <polyline points="5 12 12 5 19 12" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Quick Action Chips */}
                        <div className="flex items-center justify-start sm:justify-center gap-3 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                            {["CHECK ELIGIBILITY", "COMPARE SCHEMES", "EXPERT ANALYSIS"].map((action) => (
                                <button
                                    key={action}
                                    onClick={() => handleQuickAction(
                                        action === "CHECK ELIGIBILITY" ? "Check my eligibility for government schemes" :
                                        action === "COMPARE SCHEMES" ? "Compare schemes available for my profile" :
                                        "Give me an expert analysis of the best schemes for me"
                                    )}
                                    className="text-[10px] font-bold tracking-[0.08em] text-[#6B7F5E] hover:text-[#3D4F2F] hover:bg-[#F0F4EC] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 border border-[#D4DEC8] sm:border-transparent bg-white sm:bg-transparent"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
