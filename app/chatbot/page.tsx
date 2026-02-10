
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'recommendation';
    recommendations?: any[];
}

export default function ChatbotPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am Sangam AI, your intelligent guide to government schemes. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // 1. Analyze Intent (Fire and forget, or log)
            fetch('/api/ai/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            }).then(res => res.json()).then(data => console.log('User Intent:', data)).catch(console.error);

            // 2. Chat Response
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            // Stream handling
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) return;

            // Add placeholder for assistant response
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    const newContent = lastMsg.content + chunk;
                    return [...prev.slice(0, -1), { ...lastMsg, content: newContent }];
                });
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the AI service. Please ensure Ollama is running locally." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSmartRecommendations = async () => {
        if (!user || loading) return;
        setLoading(true);

        // Add user request message
        setMessages(prev => [...prev, { role: 'user', content: "Please analyze my profile and recommend the best government schemes for me based on my eligibility." }]);

        try {
            // Call Rank API
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
                        <p className="text-blue-200 text-sm">Powered by Ollama (Mistral 7B)</p>
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
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                                    }`}>
                                    <div className="prose prose-sm max-w-none break-words">
                                        {msg.role === 'assistant' ? (
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
                                                msg.content ? (
                                                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                                                ) : (
                                                    <span className="flex gap-1 items-center h-6">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <form onSubmit={handleSubmit} className="flex gap-3 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about any government scheme..."
                                className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[60px]"
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
        </main>
    );
}
