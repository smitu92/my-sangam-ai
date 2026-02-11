"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    GraduationCap,
    Home,
    Sprout,
    HeartPulse,
    Briefcase,
    Coins,
    Users,
    Landmark
} from "lucide-react";

interface Scheme {
    id: string;
    title: string;
    description: string;
    category: string;
    benefits: string;
    matchScore?: number;
    matchReason?: string;
}

export default function SchemesPage() {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [allRecommendations, setAllRecommendations] = useState<Scheme[]>([]);
    const [recommendations, setRecommendations] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [recLoading, setRecLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const schemesSectionRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSchemes, setTotalSchemes] = useState(0);
    const limit = 6; // Items per page

    // Fetch Schemes with Pagination and Filtering
    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    category: activeCategory !== "All" ? activeCategory : "",
                    page: currentPage.toString(),
                    limit: limit.toString(),
                    search: searchQuery
                });
                const res = await fetch(`/api/schemes?${query.toString()}`);
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
    }, [activeCategory, currentPage, searchQuery]);

    // Randomize 3 schemes from the pool
    const rotateRecommendations = useCallback(() => {
        if (allRecommendations.length === 0) return;

        setRecLoading(true);
        // Simulate a small delay for better UX (so user sees the refresh happen)
        setTimeout(() => {
            const shuffled = [...allRecommendations].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled.slice(0, 3));
            setRecLoading(false);
        }, 400);
    }, [allRecommendations]);

    // Fetch Recommendations (Pool of 20)
    const fetchRecommendations = useCallback(async (forceRefresh = false) => {
        if (!user?.id) return;

        setRecLoading(true);
        // Artificial Delay for UX (10 seconds) - Ensure this runs every time
        await new Promise(resolve => setTimeout(resolve, 10000));

        const cacheKey = `recs_pool_${user.id}`;

        // 1. Try to load from Local Storage first
        if (!forceRefresh) {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    // 24 hour cache for the pool
                    if ((Date.now() - parsed.timestamp) < 86400000) {
                        setAllRecommendations(parsed.data);
                        setRecLoading(false);
                        return; // Found in cache
                    }
                } catch (e) {
                    localStorage.removeItem(cacheKey);
                }
            }
        }

        // 2. Fetch from API if no cache or force refresh
        try {
            const res = await fetch("/api/schemes/recommend");
            if (res.ok) {
                const data = await res.json();
                const pool = data || [];
                setAllRecommendations(pool);
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: pool,
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setRecLoading(false);
        }
    }, [user?.id]);

    // Initial Load
    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    // Whenever we have a new pool of recommendations, rotate to show 3
    useEffect(() => {
        if (allRecommendations.length > 0) {
            // Only rotate if we don't have recommendations shown yet OR if we just fetched a new pool
            // Actually, we want to rotate on mount if we have data.
            // Since allRecommendations is set on mount (from cache or api), this will trigger.
            // But we don't want to infinite loop.
            // Let's just check if recommendations is empty?
            // No, because user might want to refresh.
            // The rotateRecommendations function relies on allRecommendations.

            // If recommendations are empty, definitely rotate.
            if (recommendations.length === 0) {
                // Inline rotation to avoid double-loading state
                const shuffled = [...allRecommendations].sort(() => 0.5 - Math.random());
                setRecommendations(shuffled.slice(0, 3));
            }
        }
    }, [allRecommendations, recommendations.length]);

    const categoryList = [
        { name: "All", label: "All Schemes", icon: LayoutGrid },
        { name: "Education", label: "Education", icon: GraduationCap },
        { name: "Housing", label: "Housing", icon: Home },
        { name: "Agriculture", label: "Agriculture", icon: Sprout },
        { name: "Healthcare", label: "Health", icon: HeartPulse },
        { name: "Business", label: "Business", icon: Briefcase },
        { name: "Finance", label: "Finance", icon: Coins },
        { name: "Social Welfare", label: "Social", icon: Users }
    ];

    const handleCategoryChange = (val: string) => {
        setActiveCategory(val);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        if (schemesSectionRef.current) {
            const yOffset = -100;
            const element = schemesSectionRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <main className="min-h-screen pb-20 bg-[#f3f0e9] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">

            {/* 1. HERO SECTION (Adapted from Home Page Design) */}
            <section className="relative w-full pt-32 pb-12 flex items-center justify-center overflow-hidden bg-[#111111] text-white">

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1a1a1a,transparent)]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 shadow-sm mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span className="tracking-widest uppercase text-[10px] font-bold">National Portal</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                        Discover Your <br />
                        <span className="text-white">Perfect Scheme</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
                        Access over {totalSchemes > 0 ? totalSchemes + '+' : '110+'} government opportunities tailored to your profile.
                        AI-powered matching ensures you never miss a benefit.
                    </p>


                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12 relative z-20">

                {/* 2. RECOMMENDATIONS SECTION (Restored Grid/Slider Logic) */}
                {user && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recommended for You</h2>
                                <button
                                    onClick={rotateRecommendations}
                                    disabled={recLoading}
                                    title="Refresh AI Recommendations"
                                    className={`p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all text-gray-400 hover:text-gray-900 ${recLoading ? 'animate-spin' : ''}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {recLoading ? (
                            <div className="grid md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-sm border border-gray-100"></div>
                                ))}
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.slice(0, 3).map((scheme) => (
                                    <div key={scheme.id} className="relative group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all hover:border-gray-400 hover:shadow-md overflow-hidden">

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded border border-gray-200 uppercase tracking-wider">{scheme.category}</span>

                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:underline decoration-2 underline-offset-4">{scheme.title}</h3>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Why this matches</p>
                                                <p className="text-sm text-gray-700 font-medium leading-relaxed">"{scheme.matchReason || "Matches your profile criteria."}"</p>
                                            </div>
                                            <Link href={`/schemes/${scheme.id}`} className="block w-full text-center py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold rounded-xl text-sm transition-all">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                                <p className="text-gray-500 font-medium">No specific recommendations found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. CATEGORIES SECTION (Refined Professional Design) */}
                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-[900] text-gray-900 tracking-tight leading-none mb-2">Explore Categories</h2>
                            <p className="text-gray-500 font-bold text-sm">Browse our curated collection</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {categoryList.map((cat) => {
                            const isActive = activeCategory === cat.name;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => handleCategoryChange(cat.name)}
                                    className={`group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border ${isActive
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                        : 'bg-white border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mb-3 transition-colors ${isActive ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-gray-200'
                                        }`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                                    </div>
                                    <span className="text-xs font-bold text-center leading-tight tracking-wide">
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Moved Search Bar */}
                <div className="mb-12">
                    <div className="relative max-w-2xl mx-auto group">
                        <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-2 flex items-center shadow-lg hover:shadow-xl hover:border-gray-200 transition-all">
                            <Search className="w-6 h-6 text-gray-400 ml-4" />
                            <input
                                type="text"
                                placeholder="Search for schemes (e.g. 'Student Scholarship')..."
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 px-4 py-3 text-lg font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setCurrentPage(1);
                                    }
                                }}
                            />
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. SCHEMES LIST SECTION */}
                <div ref={schemesSectionRef} className="pb-12">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">

                            <div className="w-1.5 h-8 bg-gray-900 rounded-full"></div>
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                                {activeCategory === "All" ? "All Schemes" : `${activeCategory}`}
                                <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
                                    {totalSchemes}
                                </span>
                            </h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(n => <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100"></div>)}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            {schemes.map((scheme) => (
                                <div key={scheme.id} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-400 transition-all duration-300 flex flex-col group shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {scheme.category}
                                        </span>
                                        <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                            Active
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:underline decoration-2 underline-offset-4">
                                        {scheme.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                        {scheme.description}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-gray-900"></span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Benefits Available</span>
                                        </div>
                                        <Link href={`/schemes/${scheme.id}`} className="px-6 py-2.5 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg text-sm font-bold transition-all">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {/* Refined Pagination / Scroll Animations */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 animate-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-bold"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border ${currentPage === pageNum
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-110'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all font-bold"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}


