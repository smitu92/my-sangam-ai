
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

interface Scheme {
    id: string;
    title: string;
    description: string;
    category: string;
    benefits: string;
    tags: string[];
    matchScore?: number;
    matchReason?: string;
}

export default function SchemesPage() {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [recommendations, setRecommendations] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [recLoading, setRecLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const schemesSectionRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSchemes, setTotalSchemes] = useState(0);
    const limit = 6;

    // Fetch Schemes with Pagination and Filtering
    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/schemes?category=${activeCategory}&page=${currentPage}&limit=${limit}`);
                const data = await res.json();
                if (data.schemes) {
                    setSchemes(data.schemes);
                    setTotalPages(data.pagination.totalPages);
                    setTotalSchemes(data.pagination.total);
                }
            } catch (error) {
                console.error("Failed to fetch schemes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, [activeCategory, currentPage]);

    // Optimized Recommendation logic with LocalStorage Caching
    const fetchRecommendations = useCallback(async (forceRefresh = false) => {
        if (!user?.id) return;

        const cacheKey = `recs_${user.id}`;

        // Check cache if not forcing refresh
        if (!forceRefresh) {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    // Check if cache is fresh (e.g., less than 1 hour old)
                    const isFresh = (Date.now() - parsed.timestamp) < 3600000;
                    if (isFresh) {
                        setRecommendations(parsed.data);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem(cacheKey);
                }
            }
        }

        setRecLoading(true);
        try {
            const res = await fetch("/api/schemes/recommend");
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data || []);
                // Save to cache
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: data,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setRecLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Preset categories
    const categoryList = [
        { name: "All" },
        { name: "Agriculture" },
        { name: "Education" },
        { name: "Healthcare" },
        { name: "Housing" },
        { name: "Business" },
        { name: "Technology" },
        { name: "Finance" },
        { name: "Social Welfare" }
    ];

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen pb-20 bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-[#0F172A] pb-36 pt-40 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] opacity-50 mix-blend-screen"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/5 text-blue-300 border border-white/10 text-[10px] font-black tracking-[0.3em] mb-8 backdrop-blur-xl shadow-2xl uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        National Portal
                    </span>
                    <h1 className="text-5xl md:text-7xl font-[900] text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-8 leading-[1.1] tracking-tighter pb-2">
                        Your Future, <br className="hidden md:block" /> Guaranteed.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        Discover 110+ high-impact government schemes tailored specifically to your profile and location.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 space-y-12">

                {/* 1. Recommended Section with Match % and Cache Refresh */}
                {user && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white drop-shadow-md">Recommended for You ✨</h2>
                                <button
                                    onClick={() => fetchRecommendations(true)}
                                    disabled={recLoading}
                                    title="Refresh AI Recommendations"
                                    className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white/80 hover:text-white ${recLoading ? 'animate-spin' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </button>
                            </div>
                            {recommendations.length > 0 && !recLoading && (
                                <span className="text-[10px] text-blue-200 font-bold tracking-widest uppercase bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-sm">
                                    AI-Powered Insights
                                </span>
                            )}
                        </div>

                        {recLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden h-64">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
                                        <div className="h-6 w-3/4 bg-white/10 rounded mb-4"></div>
                                        <div className="h-20 w-full bg-white/5 rounded-lg mb-4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.slice(0, 3).map((scheme) => (
                                    <div key={scheme.id} className="relative group bg-white rounded-2xl p-6 border border-indigo-100 shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                                        {/* Background Decoration */}
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">{scheme.category}</span>
                                                <div className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    {scheme.matchScore}% Match
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{scheme.title}</h3>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 relative group/insight">
                                                <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-tighter mb-1">Why this matches?</p>
                                                <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">"{scheme.matchReason}"</p>
                                            </div>
                                            <Link href={`/schemes/${scheme.id}`} className="block w-full text-center py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98]">
                                                Review Eligibility
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center animate-pulse">
                                <p className="text-white/60 font-medium">Getting fresh recommendations for you...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Premium Browse by Category */}
                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 flex items-center justify-center text-3xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] text-white border border-white/20 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                📂
                            </div>
                            <div>
                                <h2 className="text-4xl font-[900] text-slate-900 tracking-tight leading-none mb-2">Explore Categories</h2>
                                <p className="text-slate-500 font-bold flex items-center gap-2 text-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Browse through our curated scheme library
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categoryList.map((cat) => {
                            const isActive = activeCategory === cat.name;

                            // Map category names to their signature colors for the UI glow
                            const catColors: Record<string, string> = {
                                "All": "blue",
                                "Agriculture": "emerald",
                                "Education": "amber",
                                "Healthcare": "rose",
                                "Housing": "violet",
                                "Business": "pink",
                                "Technology": "cyan",
                                "Finance": "green",
                                "Social Welfare": "orange"
                            };
                            const accent = catColors[cat.name] || "blue";

                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => handleCategoryChange(cat.name)}
                                    className={`group relative p-8 rounded-[2.5rem] text-left transition-all duration-700 border-2 overflow-hidden flex flex-col justify-between h-48 ${isActive
                                        ? 'bg-[#1E293B] border-slate-900 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] -translate-y-3'
                                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] hover:-translate-y-2'
                                        }`}
                                >
                                    {/* Targeted Color Glow */}
                                    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-125 ${isActive ? `bg-${accent}-400` : `bg-${accent}-200 opacity-0 group-hover:opacity-40`
                                        }`}></div>

                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-slate-50 border border-slate-100'
                                        }`}>
                                        <CategoryIcon name={cat.name} isActive={isActive} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className={`font-black text-xl tracking-tighter transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-800'
                                            }`}>
                                            {cat.name}
                                        </div>
                                        <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-50 ${isActive ? 'text-blue-300' : 'text-slate-400'
                                            }`}>
                                            Secure Access
                                        </div>
                                    </div>

                                    {/* Dynamic Active Indicator */}
                                    {isActive && (
                                        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-${accent}-500 rounded-full shadow-[0_0_10px_#3b82f6]`}></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Schemes List Header */}
                <div className="pt-8" ref={schemesSectionRef}>
                    <div className="flex items-center justify-between mb-10 border-b-2 border-slate-100/80 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
                                {activeCategory === "All" ? "Available Schemes" : `${activeCategory} Programs`}
                                <span className="relative flex items-center">
                                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl text-sm font-black shadow-lg shadow-blue-500/30">
                                        {totalSchemes}
                                    </span>
                                    <span className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20"></span>
                                </span>
                            </h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div
                                    key={n}
                                    className="h-[450px] bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm relative overflow-hidden animate-in fade-in zoom-in-95 duration-500"
                                    style={{ animationDelay: `${n * 80}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent -translate-x-full animate-shimmer"></div>
                                    <div className="h-24 bg-slate-50 rounded-2xl mb-8"></div>
                                    <div className="h-8 bg-slate-50 rounded-xl mb-4 w-3/4"></div>
                                    <div className="h-24 bg-slate-50 rounded-2xl mb-8"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-10 bg-slate-50 rounded-xl w-1/3"></div>
                                        <div className="h-10 bg-slate-50 rounded-xl w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div
                                key={`${activeCategory}-${currentPage}`}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out"
                            >
                                {schemes.length > 0 ? (
                                    schemes.map((scheme, idx) => (
                                        <div
                                            key={scheme.id}
                                            className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] transition-all duration-700 flex flex-col h-full hover:-translate-y-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 fill-mode-both"
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            {/* Header with Pattern */}
                                            <div className="h-32 bg-slate-50 relative overflow-hidden p-8 flex justify-between items-start">
                                                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>

                                                <span className="relative z-10 bg-white shadow-xl shadow-slate-200/50 text-slate-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.15em] border border-slate-50">
                                                    {scheme.category}
                                                </span>

                                                <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl border border-slate-50 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                    ✨
                                                </div>
                                            </div>

                                            <div className="p-8 pt-0 flex-1 flex flex-col -mt-12">
                                                <div className="relative z-10 bg-white rounded-[2.5rem] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 mb-8 min-h-[180px] group-hover:border-blue-100 transition-all duration-500 flex flex-col">
                                                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-[1.25] tracking-tight">
                                                        {scheme.title}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-semibold opacity-80">
                                                        {scheme.description}
                                                    </p>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Key Benefit</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                                            <span className="font-extrabold text-slate-800 text-sm truncate max-w-[150px]">{scheme.benefits}</span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/schemes/${scheme.id}`} className="flex items-center gap-2 text-white font-black text-xs bg-slate-900 hover:bg-blue-600 px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-500/30 group/btn">
                                                        Details
                                                        <span className="text-lg leading-none transform group-hover/btn:translate-x-1 transition-transform">→</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                        <div className="text-5xl mb-4 opacity-20">🔎</div>
                                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No matching schemes found</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mx-auto">We couldn't find any results for "{activeCategory}". Try exploring other categories.</p>
                                    </div>
                                )}
                            </div>

                            {/* Premium Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 pt-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(p => Math.max(1, p - 1));
                                        }}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all font-bold"
                                    >
                                        ←
                                    </button>

                                    <div className="flex gap-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show only 5 pages if many
                                            if (totalPages > 5 && (pageNum < currentPage - 2 || pageNum > currentPage + 2)) return null;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => {
                                                        setCurrentPage(pageNum);
                                                    }}
                                                    className={`w-12 h-12 rounded-2xl font-black transition-all text-sm border ${currentPage === pageNum
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30 -translate-y-1'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(p => Math.min(totalPages, p + 1));
                                        }}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all font-bold"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

function CategoryIcon({ name, isActive }: { name: string, isActive: boolean }) {
    // Professional color palette for each category
    const colors: Record<string, string> = {
        "All": "#3b82f6",          // Blue
        "Agriculture": "#10b981",  // Emerald
        "Education": "#f59e0b",    // Amber
        "Healthcare": "#ef4444",   // Red
        "Housing": "#8b5cf6",      // Violet
        "Business": "#ec4899",     // Pink
        "Technology": "#06b6d4",   // Cyan
        "Finance": "#22c55e",      // Green
        "Social Welfare": "#f97316" // Orange
    };

    const baseColor = isActive ? "white" : (colors[name] || "#64748b");
    const secondaryColor = isActive ? "rgba(255,255,255,0.2)" : `${baseColor}20`; // 20% opacity of base

    switch (name) {
        case "All":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" fill={secondaryColor} />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            );
        case "Agriculture":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8a9 9 0 0 1 18 0v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8z" fill={secondaryColor} />
                    <path d="M7 20h10" /><path d="M10 20v-4" /><path d="M14 20v-4" /><path d="M12 5v10" />
                </svg>
            );
        case "Education":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10l-10-5-10 5 10 5 10-5z" fill={secondaryColor} />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" /><path d="M22 10v6" />
                </svg>
            );
        case "Healthcare":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill={secondaryColor} />
                    <path d="M12 7v6M9 10h6" />
                </svg>
            );
        case "Housing":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={secondaryColor} />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            );
        case "Business":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" fill={secondaryColor} />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            );
        case "Technology":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" fill={secondaryColor} />
                    <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            );
        case "Finance":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" fill={secondaryColor} />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <path d="M8 10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2" />
                </svg>
            );
        case "Social Welfare":
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill={secondaryColor} />
                    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        default:
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={secondaryColor} />
                </svg>
            );
    }
}
