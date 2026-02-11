"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        users: 0,
        schemes: 0,
        pending: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== "admin") {
                router.push("/admin/login");
            } else {
                fetchStats();
            }
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loading || !user || user.role !== "admin") {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading Admin Dashboard...</div>;
    }

    return (
        <main className="min-h-screen bg-[#f3f0e9] text-gray-900 font-sans flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#111111] text-white hidden md:flex flex-col border-r border-white/5 z-50">
                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-lg">🏛️</span>
                        Sangam Admin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Main Menu</div>
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-bold shadow-lg ring-1 ring-white/10">
                        <span>📊</span> Dashboard
                    </Link>
                    <Link href="/admin/schemes/add" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">
                        <span>✨</span> Add New Scheme
                    </Link>
                    <Link href="/schemes" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">
                        <span>📑</span> View All Schemes
                    </Link>
                    <Link href="/loans" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">
                        <span>💸</span> Loans Management
                    </Link>
                </nav>

                <div className="p-6 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white/10">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-sm truncate text-white">{user?.name}</div>
                            <div className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🔒</span> Logout Securely
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-72 p-8 lg:p-12">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-[900] text-gray-900 tracking-tight leading-none mb-2">Overview</h2>
                        <p className="text-gray-500 font-medium">Welcome back, Administrator.</p>
                    </div>
                    <Link href="/admin/schemes/add" className="hidden md:inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <span>+</span> Create New Scheme
                    </Link>
                </header>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Stat Card 1 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl text-xl">👥</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</span>
                            </div>
                            <div className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                                {loadingStats ? '...' : stats.users.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded-lg">
                                +12% this week
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="p-3 bg-blue-100 text-blue-600 rounded-2xl text-xl">📜</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Schemes</span>
                            </div>
                            <div className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                                {loadingStats ? '...' : stats.schemes.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                Across 8 Categories
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="p-3 bg-orange-100 text-orange-600 rounded-2xl text-xl">⚠️</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Review</span>
                            </div>
                            <div className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                                {loadingStats ? '...' : stats.pending.toLocaleString()}
                            </div>
                            <div className="text-sm font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-lg">
                                Needs Attention
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-gray-900">Recent Activity</h3>
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Log</button>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-lg">
                                        {i === 1 ? '📝' : i === 2 ? '👤' : '🔔'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">New Scheme Draft Created</div>
                                        <div className="text-sm text-gray-400 font-medium">By Admin User • 2 hours ago</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111111] text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <h3 className="font-bold text-xl mb-4 relative z-10">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                                <div className="text-2xl mb-2">📢</div>
                                <div className="font-bold text-sm">Post Update</div>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                                <div className="text-2xl mb-2">🔍</div>
                                <div className="font-bold text-sm">Audit Log</div>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                                <div className="text-2xl mb-2">⚙️</div>
                                <div className="font-bold text-sm">Settings</div>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                                <div className="text-2xl mb-2">❓</div>
                                <div className="font-bold text-sm">Support</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
