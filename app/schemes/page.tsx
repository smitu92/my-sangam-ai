"use client";

import Image from "next/image";
import Link from "next/link";
import { schemes } from "../../data/schemes";

export default function SchemesPage() {
    return (
        <main className="min-h-screen pb-20 bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-[#0F172A] pb-36 pt-40 overflow-hidden">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] opacity-50 mix-blend-screen"></div>
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] opacity-40"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20 text-xs font-bold tracking-widest mb-6 backdrop-blur-sm shadow-sm ring-1 ring-blue-500/20">
                        🚀 GOVERNMENT INITIATIVES
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 mb-6 leading-tight tracking-tight drop-shadow-sm pb-1">
                        Find the Right Scheme <br className="hidden md:block" /> for Your Needs
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 opacity-90 leading-relaxed font-light">
                        Assess financial aid, subsidies, and support programs tailored for you.
                    </p>

                    {/* Key Info Cards */}
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 text-left">
                        {[
                            { title: "100% Digital Process", desc: "No more standing in queues. Apply from home.", icon: "📱" },
                            { title: "Direct Bank Transfer", desc: "Benefits credited directly to your Aadhar-linked account.", icon: "💸" },
                            { title: "24/7 Multilingual Support", desc: "Get help in your local language anytime.", icon: "🗣️" }
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
                {/* Stats / Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "Active Schemes", value: "250+", icon: "⚡", color: "text-amber-500", bg: "bg-amber-50" },
                        { label: "Beneficiaries", value: "1.2Cr", icon: "👨‍👩‍👧‍👦", color: "text-sky-500", bg: "bg-sky-50" },
                        { label: "Total Fund", value: "₹500Cr", icon: "💰", color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Paperless", value: "100%", icon: "📄", color: "text-violet-500", bg: "bg-violet-50" },
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

                {/* Schemes Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {schemes.map((scheme, idx) => {
                        // Rotation of Lighter/Fresher Gradients
                        const gradients = [
                            'from-sky-400 to-blue-500',      // Fresh Blue
                            'from-emerald-400 to-teal-500',  // Nature Green
                            'from-amber-400 to-orange-500',  // Warm Orange
                            'from-violet-400 to-fuchsia-500' // Modern Purple
                        ];
                        const gradientClass = gradients[idx % gradients.length];

                        return (
                            <div key={scheme.id} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                                {/* Card Header */}
                                <div className="h-44 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-100 transition-transform duration-700 group-hover:scale-105`}></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                                    <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm">
                                            {scheme.category}
                                        </span>
                                        <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm text-xl group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                            {scheme.id % 2 === 0 ? '🏛️' : '🌾'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-7 flex-1 flex flex-col -mt-6 relative z-10">
                                    <div className="bg-white rounded-t-3xl pt-2">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                            {scheme.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                                            {scheme.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {scheme.tags.slice(0, 2).map((tag, tIdx) => (
                                                <span key={tIdx} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {scheme.tags.length > 2 && <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-400 border border-gray-100">+ {scheme.tags.length - 2}</span>}
                                        </div>

                                        <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-0.5">Primary Benefit</p>
                                                <p className="font-bold text-green-600 text-sm truncate max-w-[150px] bg-green-50 px-2 py-0.5 rounded-md inline-block">{scheme.benefits}</p>
                                            </div>
                                            <Link href={`/schemes/${scheme.id}`} className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-500/10 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all group-hover:scale-110 group-hover:-rotate-45">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-4 4m4-4H3" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
