"use client";

import { schemes } from "../../../data/schemes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SchemeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const id = params.id ? parseInt(params.id as string) : null;
    const scheme = schemes.find(s => s.id === id);

    if (!scheme) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 bg-gray-50">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Scheme Not Found</h1>
                <p className="text-gray-500 mb-6">The scheme you are looking for does not exist or has been removed.</p>
                <Link href="/schemes" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Back to All Schemes
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "benefits", label: "Benefits" },
        { id: "eligibility", label: "Eligibility" },
        { id: "application", label: "Application Process" }
    ];

    return (
        <main className="min-h-screen pb-20 bg-gray-50">

            {/* Hero Section with Dark Grid Theme */}
            <div className="relative bg-[#0F172A] pb-24 pt-40 overflow-hidden">
                {/* Modern Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-60 mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-40"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-slate-400 text-sm mb-8">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/schemes" className="hover:text-white transition-colors">Schemes</Link>
                        <span>/</span>
                        <span className="text-white font-medium truncate max-w-[200px]">{scheme.title}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-8 items-start text-white">
                        {/* Scheme Icon */}
                        <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-5xl shadow-2xl border border-white/10 shrink-0 ring-1 ring-white/10">
                            {scheme.id % 2 === 0 ? '🏛️' : '🌾'}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 ${scheme.deadline === 'Ongoing' ? 'bg-green-500/10 text-green-300' : 'bg-orange-500/10 text-orange-300'}`}>
                                    {scheme.deadline === 'Ongoing' ? '● Active' : `Ends: ${scheme.deadline}`}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-white/10">
                                    {scheme.category}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 pb-1">
                                {scheme.title}
                            </h1>

                            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed opacity-90 font-light">
                                {scheme.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Tabs Navigation Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex overflow-x-auto scrollbar-hide gap-2 sticky top-20 z-30">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Cards */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                            {activeTab === "overview" && (
                                <div className="animate-fade-in space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">📝</span>
                                            About the Scheme
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed text-lg">
                                            The {scheme.title} is a flagship initiative designed to empower the citizens by providing {scheme.description.toLowerCase()}
                                            This scheme aims to bridge financial gaps in the {scheme.category.toLowerCase()} sector.
                                        </p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                            <h3 className="font-bold text-blue-900 mb-2">Target Beneficiaries</h3>
                                            <p className="text-blue-700 font-medium">{scheme.eligibility}</p>
                                        </div>
                                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                            <h3 className="font-bold text-green-900 mb-2">Key Benefit</h3>
                                            <p className="text-green-700 font-bold text-lg">{scheme.benefits}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {scheme.tags.map((tag, idx) => (
                                                <span key={idx} className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "benefits" && (
                                <div className="space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Scheme Benefits</h2>
                                    {[
                                        { title: "Financial Support", desc: scheme.benefits },
                                        { title: "Coverage Area", desc: `Comprehensive support for ${scheme.category.toLowerCase()} sector.` },
                                        { title: "Direct Transfer", desc: "Benefits are transferred directly to the bank account (DBT)." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 font-bold text-lg">✓</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                                <p className="text-gray-600 mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "eligibility" && (
                                <div className="space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Who can apply?</h2>
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-3xl">👤</span>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">Primary Criteria</h4>
                                                <p className="text-gray-600 mt-1">{scheme.eligibility}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-3xl">🇮🇳</span>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">Citizenship</h4>
                                                <p className="text-gray-600 mt-1">Must be a resident citizen of India.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "application" && (
                                <div className="space-y-8 animate-fade-in">
                                    <h2 className="text-2xl font-bold text-gray-900">Application Process</h2>
                                    <div className="relative border-l-2 border-blue-200 ml-4 space-y-10 pl-10 py-2">
                                        {["Check Eligibility", "Gather Documents", "Online Application", "Final Submission"].map((step, i) => (
                                            <div key={i} className="relative">
                                                <span className="absolute -left-[49px] w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">{i + 1}</span>
                                                <h4 className="font-bold text-gray-900 text-lg">{step}</h4>
                                                <p className="text-gray-600 mt-1">Detailed instruction for {step.toLowerCase()} goes here.</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar (Sticky) */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Action Card */}
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Ready to Apply?</h3>
                            <div className="space-y-3">
                                <button className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2">
                                    <span>Apply Now</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </button>
                                <button className="w-full bg-white text-gray-700 border border-gray-200 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Check Eligibility</span>
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="font-bold text-gray-900 text-sm mb-3">Required Documents</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {["Aadhar Card", "Proof of Income", "Residence Certificate", "Bank Passbook"].map((doc, i) => (
                                        <li key={i} className="flex gap-2 items-center">
                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Help Widget */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Need Help?</h3>
                            <p className="text-slate-400 text-sm mb-4 relative z-10">Our AI assistant Sam can guide you through the process.</p>
                            <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 relative z-10">
                                Chat with Support
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex gap-3">
                <button className="flex-1 bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl">Check</button>
                <button className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Apply Now</button>
            </div>
        </main>
    );
}
