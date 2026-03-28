"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

export default function LoansPage() {
    const loans = [
        {
            id: "mudra",
            title: "Mudra Loans",
            description: "Financial support for small businesses to grow. Categories: Shishu, Kishore, Tarun. Loans up to ₹10 Lakhs.",
            category: "Business",
            maxAmount: "₹10 Lakhs",
            interest: "8-10%",
            tags: ["Business", "Startup", "MSME"]
        },
        {
            id: "kcc",
            title: "Kisan Credit Card",
            description: "Affordable credit for farmers to purchase seeds, fertilizers, and equipment. Interest subvention available.",
            category: "Agriculture",
            maxAmount: "₹3 Lakhs",
            interest: "4-7%",
            tags: ["Agriculture", "Farmer", "Credit"]
        },
        {
            id: "edu",
            title: "Education Loan Scheme",
            description: "Low-interest loans for students pursuing higher education in India or abroad with subsidy options.",
            category: "Education",
            maxAmount: "₹20 Lakhs",
            interest: "6-9%",
            tags: ["Student", "Higher Ed", "Subsidy"]
        },
        {
            id: "standup",
            title: "Stand-Up India",
            description: "Bank loans between ₹10 lakh and ₹1 Crore for SC/ST and Women entrepreneurs to set up greenfield enterprises.",
            category: "Entrepreneurship",
            maxAmount: "₹1 Crore",
            interest: "Floating",
            tags: ["Women", "SC/ST", "Business"]
        },
        {
            id: "pmegp",
            title: "PMEGP",
            description: "Prime Minister's Employment Generation Programme. Credit-linked subsidy scheme for generating employment.",
            category: "Employment",
            maxAmount: "₹25 Lakhs",
            interest: "Subsidy",
            tags: ["Employment", "Manufacturing", "Service"]
        },
        {
            id: "home",
            title: "Home Loan Subsidy (PMAY)",
            description: "Credit Linked Subsidy Scheme (CLSS) under Pradhan Mantri Awas Yojana for first-time home buyers.",
            category: "Housing",
            maxAmount: "₹2.67 Lakh Subsidy",
            interest: "6.5%",
            tags: ["Housing", "Urban", "Family"]
        }
    ];

    const [amount, setAmount] = useState(500000);
    const [tenure, setTenure] = useState(5);
    const [rate, setRate] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    const calculateEMI = () => {
        const principal = amount;
        const r = rate / 12 / 100;
        const n = tenure * 12;

        if (rate === 0) return principal / n;

        const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return emi;
    };

    const monthlyEMI = calculateEMI();
    const totalAmount = monthlyEMI * tenure * 12;
    const totalInterest = totalAmount - amount;

    const filteredLoans = loans.filter(loan => {
        const query = searchQuery.toLowerCase();
        return (
            loan.title.toLowerCase().includes(query) ||
            loan.description.toLowerCase().includes(query) ||
            loan.category.toLowerCase().includes(query) ||
            loan.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });

    return (
        <main className="min-h-screen pb-20 bg-[#f3f0e9] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">

            {/* 1. HERO SECTION (Matched to Schemes Page) */}
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
                        <span className="tracking-widest uppercase text-[10px] font-bold">Financial Support</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                        Government <br />
                        <span className="text-white">Loan Schemes</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
                        Get low-interest loans, subsidies, and credit support for your business, education, or farming needs.
                    </p>

                    {/* Search Bar Visual */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
                            <Search className="w-6 h-6 text-gray-400 ml-4" />
                            <input
                                type="text"
                                placeholder="Search for loans (e.g. 'Business Loan')..."
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-4 py-3 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12 relative z-20">

                {/* 2. LOANS LIST SECTION */}
                <div className="pb-12">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-gray-900 rounded-full"></div>
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                                Popular Loans
                                <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
                                    {filteredLoans.length}
                                </span>
                            </h3>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredLoans.map((loan) => (
                            <div key={loan.id} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-400 transition-all duration-300 flex flex-col group shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {loan.category}
                                    </span>
                                    <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        Active
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:underline decoration-2 underline-offset-4 line-clamp-1">
                                    {loan.title}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                                    {loan.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Max Amount</p>
                                        <p className="font-bold text-gray-900">{loan.maxAmount}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Interest</p>
                                        <p className="font-bold text-indigo-700">{loan.interest}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gray-900"></span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Apply Now</span>
                                    </div>
                                    <button className="px-6 py-2.5 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg text-sm font-bold transition-all">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. CALCULATOR SECTION */}
                <div className="pb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimate Your Repayments</h2>
                        <p className="text-gray-500">Calculate your monthly EMI based on loan amount and tenure.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-visible">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2 w-full">
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="font-bold text-gray-700 text-lg">Loan Amount</label>
                                            <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">₹ {amount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10000"
                                            max="1000000"
                                            step="10000"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                            <span>₹10k</span>
                                            <span>₹10L</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="font-bold text-gray-700 text-lg">Tenure (Years)</label>
                                            <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{tenure} Years</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={tenure}
                                            onChange={(e) => setTenure(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                            <span>1 Yr</span>
                                            <span>20 Yrs</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="font-bold text-gray-700 text-lg">Interest Rate (% p.a.)</label>
                                            <span className="text-indigo-600 font-extrabold text-xl bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{rate}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="4"
                                            max="20"
                                            step="0.5"
                                            value={rate}
                                            onChange={(e) => setRate(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                                            <span>4%</span>
                                            <span>20%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-1/2 w-full bg-[#111111] rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden ring-4 ring-gray-50">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Estimated Monthly EMI</p>
                                <div className="text-5xl sm:text-6xl font-black mb-4 tracking-tight">₹ {monthlyEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">
                                    <span>Total Interest: ₹{(totalInterest / 100000).toFixed(1)}L</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Total Payable: ₹{(totalAmount / 100000).toFixed(1)}L</span>
                                </div>

                                <button className="bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-gray-200 transition-all w-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                                    Apply for Loan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
