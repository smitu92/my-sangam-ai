"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "../../data/schemes";

export default function CategoriesPage() {
    return (
        <main className="w-full pb-20 bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-[#0F172A] pb-36 pt-40 overflow-hidden">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[100px] opacity-60 mix-blend-screen animate-pulse"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 text-center">
                    <span className="bg-green-500/10 backdrop-blur text-green-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-green-500/20 inline-block mb-6 shadow-sm ring-1 ring-green-500/10">
                        Smart Navigation
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                        Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-teal-300">Category</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed opacity-90 mb-12">
                        Find government schemes tailored to your specific needs. From agriculture to education, we cover it all.
                    </p>

                    {/* Key Info Cards */}
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 text-left">
                        {[
                            { title: "Smart Categorization", desc: "Schemes are grouped for easy discovery by sector.", icon: "🧩" },
                            { title: "One-Click Filter", desc: "Quickly sort through thousands of initiatives.", icon: "⚡" },
                            { title: "Updated Daily", desc: "Our database is refreshed every 24 hours.", icon: "📅" }
                        ].map((info, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/10 transition-colors cursor-default">
                                <div className="text-2xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">{info.icon}</div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1">{info.title}</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">{info.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { label: "Total Categories", value: "24", icon: "📚", color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Schemes Listed", value: "850+", icon: "📋", color: "text-green-500", bg: "bg-green-50" },
                        { label: "New Additions", value: "12", icon: "✨", color: "text-indigo-500", bg: "bg-indigo-50" },
                        { label: "Beneficiaries", value: "2M+", icon: "👥", color: "text-teal-500", bg: "bg-teal-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-default group">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide opacity-70">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {[
                        { ...categories[0], gradient: 'from-green-400 to-emerald-500', icon: "🌾", desc: "Support for cultivation, equipment, and insurance." },
                        { ...categories[1], gradient: 'from-blue-400 to-cyan-500', icon: "🎓", desc: "Scholarships, loans, and skill development programs." },
                        { ...categories[2], gradient: 'from-red-400 to-rose-500', icon: "👩‍⚕️", desc: "Maternity benefits, self-help groups, and safety." },
                        { ...categories[3], gradient: 'from-purple-400 to-violet-500', icon: "💼", desc: "Startups, MSMEs, and trade incentives." },
                        { ...categories[4], gradient: 'from-orange-400 to-amber-500', icon: "👴", desc: "Pensions, healthcare, and travel concessions." },
                        { ...categories[5], gradient: 'from-teal-400 to-cyan-500', icon: "🏥", desc: "Insurance, hospital schemes, and wellness centers." },
                        // Additional mocked categories
                        { name: "Housing", count: 85, icon: "🏠", gradient: 'from-yellow-400 to-amber-500', desc: "Affordable housing subsidies and rental schemes." },
                        { name: "Skills", count: 120, icon: "🛠️", gradient: 'from-indigo-400 to-blue-500', desc: "Vocational training and employment generation." },
                        { name: "Sports", count: 45, icon: "🏅", gradient: 'from-pink-400 to-fuchsia-500', desc: "Training, scholarships, and infrastructure." },
                    ].map((cat, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="h-44 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-100 transition-transform duration-700 group-hover:scale-105`}></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                                <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm">
                                        Sector
                                    </span>
                                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm text-xl group-hover:bg-white group-hover:text-green-600 transition-colors">
                                        {cat.icon}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-5 text-white">
                                    <p className="text-xs opacity-80 font-medium uppercase tracking-wider mb-1">Active Schemes</p>
                                    <p className="text-3xl font-bold">{cat.count}+</p>
                                </div>
                            </div>

                            <div className="p-7 flex-1 flex flex-col -mt-6 relative z-10">
                                <div className="bg-white rounded-t-3xl pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
                                        {cat.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                                        {cat.desc}
                                    </p>
                                </div>

                                <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                                    <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                        Prepare Documents
                                    </button>
                                    <button className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-md border border-gray-200 flex items-center justify-center text-green-600 shadow-lg shadow-green-500/10 hover:bg-green-600 hover:text-white hover:border-green-500 transition-all group-hover:scale-110 group-hover:-rotate-45">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-4 4m4-4H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
