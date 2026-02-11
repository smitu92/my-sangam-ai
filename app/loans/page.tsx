"use client";

import Image from "next/image";
import Link from "next/link";

export default function LoansPage() {
    return (
        <main className="w-full pb-20 bg-[#f3f0e9] min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-[#111111] pb-36 pt-40 overflow-hidden text-white">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1a1a1a,transparent)]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 text-center">
                    <span className="bg-white/5 border border-white/10 text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block mb-6 shadow-sm">
                        Financial Support
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                        Government <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white">Loan Schemes</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed opacity-90 mb-12">
                        Get low-interest loans, subsidies, and credit support for your business, education, or farming needs.
                    </p>

                    {/* Key Info Cards (Replaced Search) */}
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 text-left">
                        {[
                            { title: "Low Interest Rates", desc: "Starting from as low as 4% p.a. for special categories.", icon: "📉" },
                            { title: "Collateral Free", desc: "Loans up to ₹10 Lakhs without any guarantee.", icon: "🔓" },
                            { title: "Fast Approval", desc: "Digital processing with approval in < 48 hours.", icon: "⚡" }
                        ].map((info, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/10 transition-colors cursor-default">
                                <div className="text-2xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">{info.icon}</div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1">{info.title}</h3>
                                    <p className="text-gray-400 text-xs leading-relaxed">{info.desc}</p>
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
                        { label: "Active Loans", value: "15+", icon: "💼", color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Disbursed", value: "₹200Cr", icon: "💰", color: "text-green-500", bg: "bg-green-50" },
                        { label: "Avg. Interest", value: "7.5%", icon: "📉", color: "text-indigo-500", bg: "bg-indigo-50" },
                        { label: "Success Rate", value: "92%", icon: "✅", color: "text-teal-500", bg: "bg-teal-50" },
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

                {/* Loan Categories Grid (Scheme Card Style) */}
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Loan Categories</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 animate-fade-in-up animate-delay-200">
                    {[
                        {
                            title: "Mudra Loans",
                            desc: "Financial support for small businesses to grow. Categories: Shishu, Kishore, Tarun.",
                            icon: "💼",
                            gradient: "from-blue-400 to-indigo-500",
                            maxAmount: "₹10 Lakhs",
                            interest: "8-10%",
                            tags: ["Business", "Startup", "MSME"]
                        },
                        {
                            title: "Kisan Credit Card",
                            desc: "Affordable credit for farmers to purchase seeds, fertilizers, and equipment.",
                            icon: "🌾",
                            gradient: "from-green-400 to-emerald-500",
                            maxAmount: "₹3 Lakhs",
                            interest: "4-7%",
                            tags: ["Agriculture", "Farmer", "Credit"]
                        },
                        {
                            title: "Education Loan",
                            desc: "Low-interest loans for students pursuing higher education in India or abroad.",
                            icon: "🎓",
                            gradient: "from-indigo-400 to-purple-500",
                            maxAmount: "₹20 Lakhs",
                            interest: "6-9%",
                            tags: ["Student", "Higher Ed", "Subsidy"]
                        },
                        {
                            title: "Stand-Up India",
                            desc: "Bank loans between ₹10 lakh and ₹1 Crore for SC/ST and Women entrepreneurs.",
                            icon: "🚀",
                            gradient: "from-orange-400 to-red-500",
                            maxAmount: "₹1 Crore",
                            interest: "Floating",
                            tags: ["Women", "SC/ST", "Business"]
                        },
                        {
                            title: "PMEGP",
                            desc: "Prime Minister's Employment Generation Programme. Credit-linked subsidy.",
                            icon: "🏭",
                            gradient: "from-teal-400 to-cyan-500",
                            maxAmount: "₹25 Lakhs",
                            interest: "Subsidy",
                            tags: ["Employment", "Manufacturing", "Service"]
                        },
                        {
                            title: "Home Loan Subsidy",
                            desc: "Credit Linked Subsidy Scheme (CLSS) under PMAY for first-time home buyers.",
                            icon: "🏠",
                            gradient: "from-pink-400 to-rose-500",
                            maxAmount: "₹2.67 Lakh",
                            interest: "6.5%",
                            tags: ["Housing", "Urban", "Family"]
                        }
                    ].map((loan, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="h-44 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${loan.gradient} opacity-100 transition-transform duration-700 group-hover:scale-105`}></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                                <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm">
                                        {loan.tags[0]}
                                    </span>
                                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm text-xl group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                        {loan.icon}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-5 text-white">
                                    <p className="text-xs opacity-80 font-medium uppercase tracking-wider mb-1">Max Amount</p>
                                    <p className="text-2xl font-bold">{loan.maxAmount}</p>
                                </div>
                            </div>

                            <div className="p-7 flex-1 flex flex-col -mt-6 relative z-10">
                                <div className="bg-white rounded-t-3xl pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                        {loan.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                                        {loan.desc}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {loan.tags.slice(1).map((tag, tIdx) => (
                                            <span key={tIdx} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                                                #{tag}
                                            </span>
                                        ))}
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                            Interest: {loan.interest}
                                        </span>
                                    </div>

                                    <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                                        <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                            View Details
                                        </button>
                                        <button className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-md border border-gray-200 flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-500/10 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all group-hover:scale-110 group-hover:-rotate-45">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-4 4m4-4H3" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loan Calculator Section (Enhanced) */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimate Your Repayments</h2>
                    <p className="text-gray-500">Calculate your monthly EMI based on loan amount and tenure.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-indigo-100 relative overflow-hidden animate-fade-in-up animate-delay-300 px-4 mb-20">
                    {/* Decorative bg elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 z-0"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full -ml-16 -mb-16 z-0"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 w-full">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="font-bold text-gray-700 text-lg">Loan Amount</label>
                                        <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">₹ 5,00,000</span>
                                    </div>
                                    <input type="range" min="10000" max="1000000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                        <span>₹10k</span>
                                        <span>₹10L</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="font-bold text-gray-700 text-lg">Tenure (Years)</label>
                                        <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">5 Years</span>
                                    </div>
                                    <input type="range" min="1" max="20" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                        <span>1 Yr</span>
                                        <span>20 Yrs</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="font-bold text-gray-700 text-lg">Interest Rate (% p.a.)</label>
                                        <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">10%</span>
                                    </div>
                                    <input type="range" min="4" max="20" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                        <span>4%</span>
                                        <span>20%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full bg-[#111111] rounded-3xl p-8 text-white text-center shadow-2xl shadow-black/40 animate-scale-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Estimated Monthly EMI</p>
                            <div className="text-6xl font-black mb-4 tracking-tight">₹ 10,625</div>
                            <div className="flex justify-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">
                                <span>Total Interest: ₹1.3L</span>
                                <span>•</span>
                                <span>Total Payable: ₹6.3L</span>
                            </div>

                            <button className="bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-gray-200 transition-all w-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                                Apply for Loan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
