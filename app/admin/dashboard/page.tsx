"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading } = useAuth();
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
        <main className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar (Mobile Hidden) */}
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-10">
                    Sangam Admin
                </h1>

                <nav className="space-y-2 flex-1">
                    <Link href="/admin/dashboard" className="block px-4 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20">Dashboard</Link>
                    <Link href="/admin/schemes/add" className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors font-medium">Add New Scheme ➕</Link>
                    <Link href="/schemes" className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors font-medium">View All Schemes</Link>
                    <a href="#" className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors font-medium">User Applications</a>
                    <a href="#" className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors font-medium">Settings</a>
                </nav>

                <div className="pt-6 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div className="font-bold text-sm truncate max-w-[150px]">{user?.name}</div>
                            <div className="text-xs text-slate-500">Super Admin</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                    <div className="flex gap-4">
                        <Link href="/admin/schemes/add" className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105">
                            <span>+</span> Add New Scheme
                        </Link>
                        <button className="md:hidden p-2 bg-slate-800 rounded-lg">Menu</button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {/* Stat 1 */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Total Users</div>
                            <div className="text-4xl font-black text-white">
                                {loadingStats ? '...' : stats.users.toLocaleString()}
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-400">
                                <span className="bg-green-500/20 px-1.5 py-0.5 rounded mr-2">Registered</span> Platform Wide
                            </div>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Active Schemes</div>
                            <div className="text-4xl font-black text-white">
                                {loadingStats ? '...' : stats.schemes.toLocaleString()}
                            </div>
                            <div className="mt-4 flex items-center text-sm text-blue-400">
                                <span className="bg-blue-500/20 px-1.5 py-0.5 rounded mr-2">Live</span> Now Available
                            </div>
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-orange-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Inactive / Closed</div>
                            <div className="text-4xl font-black text-white">
                                {loadingStats ? '...' : stats.pending.toLocaleString()}
                            </div>
                            <div className="mt-4 flex items-center text-sm text-orange-400">
                                Requires attention
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Applications (Mock) */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <h3 className="font-bold text-lg">Recent Applications</h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-bold">View All</button>
                    </div>
                    <div className="divide-y divide-slate-700">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="p-4 hover:bg-slate-700/30 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">U{item}</div>
                                    <div>
                                        <div className="font-bold text-sm">User Name {item}</div>
                                        <div className="text-xs text-slate-400">Applied for PM Kisan Yojana</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-500">2 hours ago</span>
                                    <button className="px-3 py-1 text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">Review</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
