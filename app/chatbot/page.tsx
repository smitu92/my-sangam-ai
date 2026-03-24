"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────── */
interface SchemeCard {
    scheme_id: string;
    scheme_name: string;
    level: string;
    category: string;
    official_url?: string;
}

interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    schemesFound?: SchemeCard[];
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
                    data.session.messages.map((m: any) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        schemesFound: m.schemesFound,
                        createdAt: m.createdAt,
                    }))
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
    }, [messages]);

    /* ── Auto-resize textarea ─────────────────────────────── */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
        }
    }, [input]);

    /* ── New Chat ─────────────────────────────────────────── */
    const handleNewChat = async () => {
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

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            // Build chat_history for FastAPI v2
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

            const assistantMsg: Message = {
                role: "assistant",
                content: data.answer || "I couldn't find a relevant answer. Try rephrasing your question.",
                schemesFound: data.schemes_found || [],
            };

            setMessages((prev) => [...prev, assistantMsg]);

            // Update session title in sidebar if it was auto-titled
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
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ Could not reach the AI backend. Make sure FastAPI is running on localhost:8000.",
                },
            ]);
        } finally {
            setLoading(false);
        }
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

    /* ── Scheme card level color ──────────────────────────── */
    const getLevelColor = (level: string) => {
        if (level === "Central") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        if (level === "State") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    };

    /* ── Loading state ────────────────────────────────────── */
    if (authLoading) {
        return (
            <div className="h-screen bg-[#111111] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    /* ── Render ───────────────────────────────────────────── */
    return (
        <div className="h-screen bg-[#111111] flex overflow-hidden text-white font-sans">
            {/* ══════════ Sidebar ══════════ */}
            <aside
                className={`${sidebarOpen ? "w-72" : "w-0"
                    } transition-all duration-300 ease-in-out bg-[#1a1a1a] border-r border-white/[0.06] flex flex-col overflow-hidden shrink-0`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/[0.06]">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] transition-all group"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white transition-colors">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">New Chat</span>
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 chat-scrollbar">
                    {sessionLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-2xl mb-2">💬</div>
                            <p className="text-sm text-gray-500">No conversations yet</p>
                            <p className="text-xs text-gray-600 mt-1">Start a new chat to begin</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group relative rounded-lg transition-all ${activeSessionId === session.id
                                    ? "bg-white/[0.08] border border-white/[0.1]"
                                    : "hover:bg-white/[0.04] border border-transparent"
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
                                            className="w-full bg-white/[0.05] border border-white/[0.15] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                ) : deleteConfirm === session.id ? (
                                    <div className="p-3 space-y-2">
                                        <p className="text-xs text-gray-400">Delete this chat?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteSession(session.id)}
                                                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setActiveSessionId(session.id);
                                            if (window.innerWidth < 768) setSidebarOpen(false);
                                        }}
                                        className="w-full text-left p-3 flex items-start gap-3"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 mt-0.5 shrink-0">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-200 truncate">{session.title}</p>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                                {new Date(session.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </p>
                                        </div>

                                        {/* Action buttons (visible on hover) */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingSessionId(session.id);
                                                    setEditTitle(session.title);
                                                }}
                                                className="p-1 rounded hover:bg-white/[0.1] transition-colors"
                                                title="Rename"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(session.id);
                                                }}
                                                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                                                title="Delete"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 hover:text-red-400">
                                                    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Footer — User info + back */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Sangam
                    </Link>
                </div>
            </aside>

            {/* ══════════ Main Chat Area ══════════ */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* ── Chat Header ────────────────────────────── */}
                <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0 bg-[#111111]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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

                        <div>
                            <h1 className="text-sm font-semibold text-gray-200">Sangam AI</h1>
                            <p className="text-[10px] text-gray-500">Powered by Gemini 2.5 Flash + RAG</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleNewChat}
                            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                            title="New Chat"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* ── Messages Area ──────────────────────────── */}
                <div className="flex-1 overflow-y-auto chat-scrollbar">
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        {/* Welcome message when no session or empty */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Sangam AI Assistant</h2>
                                <p className="text-gray-500 text-center max-w-md mb-8">
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
                                            className="text-left text-sm p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-gray-200 transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} chatMsg`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex gap-3"}`}>
                                    {/* Assistant avatar */}
                                    {msg.role === "assistant" && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}

                                    <div
                                        className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                                            : "bg-white/[0.04] text-gray-200 border border-white/[0.06] rounded-tl-sm"
                                            }`}
                                    >
                                        {/* Message content */}
                                        <div
                                            className="text-sm leading-relaxed break-words prose-invert"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.content
                                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                    .replace(/\n/g, "<br/>"),
                                            }}
                                        />

                                        {/* Scheme Cards */}
                                        {msg.schemesFound && msg.schemesFound.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                                                    📋 Matching Schemes
                                                </div>
                                                {msg.schemesFound.map((scheme, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group cursor-pointer"
                                                    >
                                                        <div className="font-semibold text-sm text-gray-100 group-hover:text-white transition-colors mb-2">
                                                            {scheme.scheme_name || "Unnamed Scheme"}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelColor(scheme.level)}`}>
                                                                {scheme.level || "—"}
                                                            </span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                                {scheme.category || "—"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start chatMsg">
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1.5 items-center h-5">
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* ── Input Area ─────────────────────────────── */}
                <div className="border-t border-white/[0.06] p-4 bg-[#111111]">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex items-end gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 focus-within:border-white/[0.15] focus-within:bg-white/[0.06] transition-all">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about any government scheme…"
                                    rows={1}
                                    className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 px-3 py-2 resize-none outline-none overflow-hidden"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>
                        <p className="text-center mt-2 text-[10px] text-gray-600">
                            Shift+Enter for new line · AI can make mistakes — verify important info
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
