"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("applied");

    if (loading) return <div className="min-h-screen pt-32 flex justify-center text-blue-600 font-bold items-center bg-gray-50">Loading profile...</div>;

    if (!user) return <div className="min-h-screen pt-32 flex justify-center items-center">Please login to view profile</div>;

    // Use user data from context directly, with fallbacks where necessary
    const userData = {
        ...user,
        appliedSchemes: (user as any).appliedSchemes || [],
        savedSchemes: (user as any).savedSchemes || []
    };

    // Check profile completeness using Prisma fields (state is required during registration)
    // If state is missing, the user hasn't completed profile setup yet
    if (!user.state) {
        if (typeof window !== "undefined") {
            window.location.href = "/profile/setup";
        }
        return null;
    }

    return (
        <main className="min-h-screen pb-20 bg-[#f3f0e9]">

            {/* 1. Hero / Header Section */}
            <div className="relative bg-[#111111] pb-24 pt-32 overflow-hidden text-white">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1a1a1a,transparent)]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 animate-fade-in-up">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex items-center justify-center text-6xl overflow-hidden ring-1 ring-white/20">
                                {user.gender === "Female" ? "👩🏽" : "🧔🏽‍♂️"}
                            </div>
                            <Link href="/profile/setup" className="absolute bottom-2 right-2 bg-blue-600/80 backdrop-blur text-white p-2.5 rounded-full shadow-lg hover:bg-blue-500 transition-all border border-blue-400/50" title="Edit Profile">
                                ✏️
                            </Link>
                        </div>

                        {/* Main Info */}
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white">{user.name}</h1>
                                <span className="bg-white/5 border border-white/10 text-gray-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide self-center md:self-auto shadow-sm">
                                    {user.occupation || "Beneficiary"}
                                </span>
                            </div>

                            <p className="text-slate-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                                <span>📍 {user.state ? `${user.district || ""}, ${user.state}` : "Location Not Set"}</span>
                                <span>•</span>
                                <span>🎂 {user.age ? `${user.age} Years Old` : "Age Not Set"}</span>
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/10 transition-colors">
                                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Annual Income</span>
                                    <span className="font-bold text-white text-lg">₹{user.annualIncome ? user.annualIncome.toLocaleString("en-IN") : "N/A"}</span>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/10 transition-colors">
                                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Social Category</span>
                                    <span className="font-bold text-white text-lg">{user.caste || "General"}</span>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/10 transition-colors">
                                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Verifier ID</span>
                                    <span className="font-bold text-emerald-400 text-lg flex items-center gap-1">
                                        {user.aadhar ? `XXXX-${user.aadhar.slice(-4)}` : "Unverified"}
                                        {user.aadhar && <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 ml-1">✓</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Detailed Info Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up animate-delay-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal & Family Details</h2>
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Card 1: Contact Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">📞</div>
                                <div>
                                    <div className="text-sm text-gray-500">Mobile Number</div>
                                    <div className="font-bold text-gray-900">{user.mobile || "--"}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">📧</div>
                                <div>
                                    <div className="text-sm text-gray-500">Email Address</div>
                                    <div className="font-bold text-gray-900 break-all">{user.email || "--"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Family Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Family Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">👨🏼</div>
                                <div>
                                    <div className="text-sm text-gray-500">Father's Name</div>
                                    <div className="font-bold text-gray-900">{user.fatherName || "--"}</div>
                                    <div className="text-xs text-gray-400">{user.fatherProfession}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">👩🏼</div>
                                <div>
                                    <div className="text-sm text-gray-500">Mother's Name</div>
                                    <div className="font-bold text-gray-900">{user.motherName || "--"}</div>
                                    <div className="text-xs text-gray-400">{user.motherProfession}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Documents */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Identity Documents</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">AAD</div>
                                    <span className="font-medium text-gray-700 text-sm">Aadhar Card</span>
                                </div>
                                <span className={`text-xs font-bold ${user.aadhar ? "text-green-600" : "text-red-500"}`}>{user.aadhar ? "Linked ✓" : "Missing"}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">PAN</div>
                                    <span className="font-medium text-gray-700 text-sm">PAN Card</span>
                                </div>
                                <span className={`text-xs font-bold ${user.pan ? "text-green-600" : "text-red-500"}`}>{user.pan ? "Linked ✓" : "Missing"}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 3. Schemes Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up animate-delay-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Scheme Applications</h2>

                {/* Tabs */}
                <div className="bg-white rounded-t-3xl border-b border-gray-200 px-6 pt-4 flex gap-8">
                    {["applied", "saved"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 font-bold text-sm uppercase tracking-wide transition-all border-b-4 ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                        >
                            {tab === "applied" ? "Applied Schemes" : "Saved Schemes"}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-b-3xl shadow-sm border border-gray-100 p-8 min-h-[300px]">
                    {activeTab === "applied" && (
                        <div className="space-y-4">
                            {user.appliedSchemes && user.appliedSchemes.length > 0 ? (
                                user.appliedSchemes.map((scheme: any) => (
                                    <div key={scheme.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Applied on {scheme.date}</div>
                                            <h3 className="text-lg font-bold text-gray-900">{scheme.name}</h3>
                                            <div className="text-sm text-gray-600 mt-1">Benefit Amount: <span className="font-bold text-green-600">{scheme.amount}</span></div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${scheme.status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                                            scheme.status === "Processing" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-100 text-red-700 border-red-200"
                                            }`}>
                                            {scheme.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">No schemes applied yet.</div>
                            )}
                        </div>
                    )}

                    {activeTab === "saved" && (
                        <div className="space-y-4">
                            {user.savedSchemes && user.savedSchemes.length > 0 ? (
                                user.savedSchemes.map((scheme: any) => (
                                    <div key={scheme.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded inline-block mb-2 uppercase">{scheme.category}</div>
                                            <h3 className="text-lg font-bold text-gray-900">{scheme.name}</h3>
                                        </div>
                                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Apply Now</button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">No saved schemes.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </main>
    );
}
