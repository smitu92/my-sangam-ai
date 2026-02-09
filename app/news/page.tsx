"use client";

import Image from "next/image";
import Link from "next/link";

export default function NewsPage() {
    return (
        <main className="w-full pb-20 bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-[#0F172A] pb-36 pt-40 overflow-hidden">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] opacity-60 mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] opacity-40"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 text-center">
                    <span className="bg-red-500/10 backdrop-blur text-red-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-red-500/20 inline-block mb-6 shadow-sm ring-1 ring-red-500/10 animate-pulse">
                        Flash News
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                        Government <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-orange-300">Spotlight</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed opacity-90 mb-12">
                        Stay updated with the latest policy announcements, deadlines, and success stories.
                    </p>

                    {/* Key Info Cards */}
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 text-left">
                        {[
                            { title: "Real-time Updates", desc: "Get instant notifications on major scheme changes.", icon: "🔔" },
                            { title: "Verified Sources", desc: "All news is sourced directly from official government gazettes.", icon: "✅" },
                            { title: "Expert Analysis", desc: "Simplified breakdowns of complex policy documents.", icon: "💡" }
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
                        { label: "Today's Updates", value: "12", icon: "📰", color: "text-red-500", bg: "bg-red-50" },
                        { label: "Trending Topics", value: "5", icon: "🔥", color: "text-orange-500", bg: "bg-orange-50" },
                        { label: "Subscribers", value: "50k+", icon: "📧", color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Source States", value: "28", icon: "🇮🇳", color: "text-green-500", bg: "bg-green-50" },
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

                {/* News Grid (Scheme Card Style) */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            title: "New Subsidy for Electric Tractors Announced",
                            date: "2 Hours Ago",
                            tag: "Agriculture",
                            icon: "🚜",
                            gradient: "from-green-400 to-emerald-500",
                            desc: "Ministry of Agriculture increases subsidy cap for EV farm equipment to 40%."
                        },
                        {
                            title: "Mudra Loan Limit Increased to ₹20 Lakhs",
                            date: "Yesterday",
                            tag: "Business",
                            icon: "💰",
                            gradient: "from-blue-400 to-indigo-500",
                            desc: "RBI approves doubling the maximum loan limit under PM Mudra Yojana for existing borrowers."
                        },
                        {
                            title: "Scholarship Deadline Extended to March 31st",
                            date: "2 Days Ago",
                            tag: "Education",
                            icon: "📚",
                            gradient: "from-violet-400 to-purple-500",
                            desc: "National Scholarship Portal announces extension for all post-matric applications."
                        },
                        {
                            title: "Digital Health ID Now Mandatory for Insurance",
                            date: "3 Days Ago",
                            tag: "Health",
                            icon: "🏥",
                            gradient: "from-red-400 to-rose-500",
                            desc: "New guidelines require ABHA ID linkage for cashless hospitalization claims."
                        },
                        {
                            title: "Solar Rooftop Scheme Subsidy Doubled",
                            date: "Last Week",
                            tag: "Energy",
                            icon: "☀️",
                            gradient: "from-amber-400 to-orange-500",
                            desc: "PM Suryodaya Yojana to offer up to ₹78,000 subsidy for 3kW installations."
                        },
                        {
                            title: "Startups Tax Holiday Extended by 1 Year",
                            date: "Last Week",
                            tag: "Startup",
                            icon: "🚀",
                            gradient: "from-cyan-400 to-blue-500",
                            desc: "DPIIT announces one-year extension of the tax holiday for recognized startups."
                        }
                    ].map((news, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="h-44 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${news.gradient} opacity-100 transition-transform duration-700 group-hover:scale-105`}></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                                <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm">
                                        {news.tag}
                                    </span>
                                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm text-xl group-hover:bg-white group-hover:text-red-600 transition-colors">
                                        {news.icon}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-5 text-white">
                                    <p className="text-xs opacity-80 font-medium uppercase tracking-wider mb-1">Published</p>
                                    <p className="text-xl font-bold">{news.date}</p>
                                </div>
                            </div>

                            <div className="p-7 flex-1 flex flex-col -mt-6 relative z-10">
                                <div className="bg-white rounded-t-3xl pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                                        {news.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                                        {news.desc}
                                    </p>
                                </div>

                                <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                                    <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                        Read More
                                    </button>
                                    <button className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-md border border-gray-200 flex items-center justify-center text-red-600 shadow-lg shadow-red-500/10 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all group-hover:scale-110 group-hover:-rotate-45">
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
