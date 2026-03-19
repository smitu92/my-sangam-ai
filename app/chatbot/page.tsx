
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'recommendation';
    recommendations?: any[];            // kept for legacy Ollama flow
    schemes_found?: SchemeCard[];       // NEW — from FastAPI /query
}

/* ── Context Menu state ───────────────────────────────────── */

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    scheme: SchemeCard | null;
}

/* ── Build user profile string from auth context ──────────── */

function buildUserProfile(user: any): string {
    if (!user) return "Anonymous user";
    const parts: string[] = [];
    if (user.name) parts.push(`Name: ${user.name}`);
    if (user.gender) parts.push(`Gender: ${user.gender}`);
    if (user.dob) parts.push(`Date of Birth: ${user.dob}`);
    if (user.category) parts.push(`Category: ${user.category}`);
    if (user.occupation) parts.push(`Occupation: ${user.occupation}`);
    if (user.income) parts.push(`Annual Income: ${user.income}`);
    if (user.location) parts.push(`Location: ${user.location}`);
    return parts.length > 0 ? parts.join(", ") : "No profile info available";
}

/* ── Page Component ───────────────────────────────────────── */

export default function ChatbotPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am Sangam AI, your intelligent guide to government schemes. Ask me anything and I will find schemes that match your profile.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* Context menu */
    const [ctxMenu, setCtxMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, scheme: null });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    /* Close context menu on any outside click */
    useEffect(() => {
        const close = () => setCtxMenu(prev => ({ ...prev, visible: false }));
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    /* Auto-resize textarea */
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
        }
    }, [input]);

    /* ── NEW: Send to FastAPI /query ──────────────────────── */

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: input,
                    user_profile: buildUserProfile(user),
                }),
            });

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);

            const data = await response.json();

            const assistantMsg: Message = {
                role: 'assistant',
                content: data.answer || "I couldn't find a relevant answer. Try rephrasing your question.",
                schemes_found: data.schemes_found || [],
            };

            setMessages(prev => [...prev, assistantMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ Could not reach the AI backend. Make sure FastAPI is running on localhost:8000."
            }]);
        } finally {
            setLoading(false);
        }
    };

    /* Textarea keyboard: Enter sends, Shift+Enter newlines */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    /* ── LEGACY: Smart Recommendations (Ollama — kept for now) ── */

    const handleSmartRecommendations = async () => {
        if (!user || loading) return;
        setLoading(true);

        setMessages(prev => [...prev, { role: 'user', content: "Please analyze my profile and recommend the best government schemes for me based on my eligibility." }]);

        try {
            const response = await fetch('/api/ai/rank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userProfile: user })
            });

            if (!response.ok) throw new Error('Failed to fetch recommendations');

            const recommendations = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Based on your profile, here are the top schemes I've found for you:",
                type: 'recommendation',
                recommendations: recommendations
            }]);

        } catch (error) {
            console.error('Recommendation error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't generate recommendations at this time. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    /* ── Context menu handlers ────────────────────────────── */

    const handleSchemeContextMenu = (e: React.MouseEvent, scheme: SchemeCard) => {
        e.preventDefault();
        setCtxMenu({ visible: true, x: e.clientX, y: e.clientY, scheme });
    };

    const ctxNewChat = () => {
        if (!ctxMenu.scheme) return;
        setMessages([
            { role: 'assistant', content: `Let's talk about **${ctxMenu.scheme.scheme_name}**. What would you like to know?` }
        ]);
        setInput('');
        setCtxMenu({ visible: false, x: 0, y: 0, scheme: null });
    };

    const ctxUseAsReference = () => {
        if (!ctxMenu.scheme) return;
        setInput(prev => prev + (prev ? " " : "") + ctxMenu.scheme!.scheme_name);
        setCtxMenu({ visible: false, x: 0, y: 0, scheme: null });
        textareaRef.current?.focus();
    };

    const ctxOpenDetails = () => {
        if (!ctxMenu.scheme) return;
        window.location.href = `/schemes/${ctxMenu.scheme.scheme_id}`;
    };

    const ctxOpenOfficial = () => {
        if (!ctxMenu.scheme?.official_url) return;
        window.open(ctxMenu.scheme.official_url, "_blank");
    };

    /* ── Render ───────────────────────────────────────────── */

    return (
        <main className="min-h-screen bg-gray-50 pt-20 pb-4 relative flex flex-col">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-900 via-slate-900 to-black -z-10"></div>

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-6rem)]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 text-white text-lg">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span>🤖</span> Sangam AI Assistant
                        </h1>
                        <p className="text-blue-200 text-sm">Powered by Gemini 2.5 Flash + RAG</p>
                    </div>
                    <div className="flex gap-2">
                        {user && (
                            <button
                                onClick={handleSmartRecommendations}
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all animate-pulse"
                            >
                                ✨ Smart Recommendations
                            </button>
                        )}
                        <Link href="/schemes" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
                            ← Back to Schemes
                        </Link>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-200">

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{ animationDelay: '0ms' }}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                                    }`}>
                                    <div className="prose prose-sm max-w-none break-words">
                                        {msg.role === 'assistant' ? (
                                            /* Legacy recommendation cards (Ollama) */
                                            msg.type === 'recommendation' && msg.recommendations ? (
                                                <div className="space-y-4">
                                                    <p className="mb-2">{msg.content}</p>
                                                    <div className="grid gap-3">
                                                        {msg.recommendations.map((rec: any, i: number) => (
                                                            <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="font-bold text-blue-900">{rec.title}</div>
                                                                    <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                                                        {rec.score}% Match
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                                                                <Link href={`/schemes/${rec.schemeId}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                                                                    View Details →
                                                                </Link>
                                                            </div>
                                                        ))}
                                                        {msg.recommendations.length === 0 && (
                                                            <div className="text-gray-500 italic">No recommendations found matching your profile.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Answer text */}
                                                    {msg.content ? (
                                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                                                    ) : (
                                                        <span className="flex gap-1 items-center h-6">
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                                        </span>
                                                    )}

                                                    {/* NEW — Scheme cards from FastAPI */}
                                                    {msg.schemes_found && msg.schemes_found.length > 0 && (
                                                        <div className="mt-4 grid gap-3">
                                                            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">📋 Matching Schemes</div>
                                                            {msg.schemes_found.map((scheme, i) => {
                                                                const levelColor = scheme.level === "Central"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : scheme.level === "State"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-yellow-100 text-yellow-800";

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        onContextMenu={(e) => handleSchemeContextMenu(e, scheme)}
                                                                        className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm cursor-context-menu hover:shadow-md hover:border-blue-200 transition-all group"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className="font-bold text-blue-900 group-hover:text-blue-700 transition-colors">
                                                                                {scheme.scheme_name || "Unnamed Scheme"}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${levelColor}`}>
                                                                                {scheme.level || "—"}
                                                                            </span>
                                                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                                                                {scheme.category || "—"}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">🆔 ID: {scheme.scheme_id}</p>
                                                                        <p className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Right-click for options</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-start animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 p-4 shadow-sm">
                                    <span className="flex gap-1 items-center h-6">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <form onSubmit={handleSubmit} className="flex gap-3 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about any government scheme…   (Shift+Enter for new line)"
                                rows={1}
                                className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none overflow-hidden"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[60px] self-end"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="text-xl">➤</span>
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-2 text-xs text-gray-400">
                            AI can make mistakes. Please verify important information.
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Right-click context menu ─────────────────────── */}
            {ctxMenu.visible && ctxMenu.scheme && (
                <div
                    className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-64 animate-scale-in"
                    style={{ top: ctxMenu.y, left: ctxMenu.x, opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{ctxMenu.scheme.scheme_name}</p>
                    </div>
                    <button onClick={ctxNewChat} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                        💬 New chat about this scheme
                    </button>
                    <button onClick={ctxUseAsReference} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                        📌 Use as reference in current chat
                    </button>
                    <button onClick={ctxOpenDetails} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                        🔍 Open scheme details
                    </button>
                    <button
                        onClick={ctxOpenOfficial}
                        disabled={!ctxMenu.scheme.official_url}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 hover:bg-blue-50 hover:text-blue-700 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                    >
                        🌐 Official website {!ctxMenu.scheme.official_url && <span className="text-xs text-gray-400">(n/a)</span>}
                    </button>
                </div>
            )}
        </main>
    );
}
