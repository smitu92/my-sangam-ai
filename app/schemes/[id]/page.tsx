"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, use } from "react"; // Add 'use' hook
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FileText,
    Gift,
    CheckCircle,
    Files,
    Rocket,
    MapPin,
    Building2,
    Calendar,
    Globe,
    ChevronLeft,
    ChevronRight,
    Download
} from "lucide-react";

// Define Scheme Interface
interface Scheme {
    id: string;
    title: string;
    ministry: string;
    description: string;
    category: string;
    type: string;
    state: string;
    benefits: string;
    eligibility: string;
    documentsRequired: string[];
    amount: number | null;
    gender: string;
    ageMin: number | null;
    ageMax: number | null;
    incomeLimit: number | null;
    caste: string[];
    residence: string;
    deadline: string | null;
    status: string;
    applicationUrl: string | null;
    tags: string[];
}

export default function SchemeDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>; // Params must be a Promise in Next.js 15+ for client components
}) {
    const { id } = use(params); // Unwrap params with React.use()
    const { user } = useAuth();
    const router = useRouter();
    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState('overview');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [eligibilityData, setEligibilityData] = useState<{ chance: string, criteria: { label: string, match: boolean }[] } | null>(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(false);

    // Dynamic AI Eligibility Fetching
    useEffect(() => {
        if (activeSection === 'eligibility' && !eligibilityData && !eligibilityLoading && id) {
            setEligibilityLoading(true);
            fetch(`/api/schemes/${id}/eligibility`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.chance) {
                        setEligibilityData(data);
                    }
                })
                .catch(err => console.error("Eligibility check failed", err))
                .finally(() => setEligibilityLoading(false));
        }
    }, [activeSection, id, eligibilityData, eligibilityLoading]);

    useEffect(() => {
        const fetchScheme = async () => {
            try {
                const res = await fetch(`/api/schemes/${id}`);
                if (!res.ok) throw new Error("Scheme not found");
                const data = await res.json();
                setScheme(data.scheme);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchScheme();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Scheme Not Found 😕</h1>
                <p className="text-gray-600 mb-6">The scheme you are looking for might have been removed or does not exist.</p>
                <Link href="/schemes" className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold shadow-lg hover:bg-black transition-colors">
                    Browse All Schemes
                </Link>
            </div>
        );
    }

    const isEligible = true; // TODO: Implement eligibility check logic later

    return (
        <main className="min-h-screen bg-[#f3f0e9] pt-24 pb-20 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">

                {/* Breadcrumb */}
                <div className="mb-6 sm:mb-8 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-2">
                    <Link href="/schemes" className="text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap">Schemes</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-bold break-words">{scheme.title}</span>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8 items-start">

                    {/* Left Column: Navigation (Tabs) */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-24">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Scheme Details</h3>
                            </div>
                            <nav className="flex flex-col p-2 space-y-1">
                                {[
                                    { id: 'overview', label: 'Overview & Details', icon: FileText },
                                    { id: 'benefits', label: 'Benefits & Amount', icon: Gift },
                                    { id: 'eligibility', label: 'Eligibility Criteria', icon: CheckCircle },
                                    { id: 'documents', label: 'Required Documents', icon: Files },
                                    { id: 'apply', label: 'Apply Now', icon: Rocket }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${activeSection === item.id
                                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="text-lg"><item.icon className="w-5 h-5" /></span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Middle Column: Active Content */}
                    <div className="lg:col-span-3 space-y-8 min-h-[500px] w-full max-w-full">

                        {/* Mobile Tabs */}
                        <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide w-full max-w-full">
                            {[
                                { id: 'overview', label: 'Overview', icon: FileText },
                                { id: 'benefits', label: 'Benefits', icon: Gift },
                                { id: 'eligibility', label: 'Eligibility', icon: CheckCircle },
                                { id: 'documents', label: 'Documents', icon: Files },
                                { id: 'apply', label: 'Apply', icon: Rocket }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeSection === item.id
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200'
                                        }`}
                                >
                                    <span><item.icon className="w-4 h-4" /></span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {activeSection === 'overview' && (
                            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                                    <span className="bg-gray-100 text-gray-900 border border-gray-200 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
                                        {scheme.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${scheme.status === 'active' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                        {scheme.status}
                                    </span>
                                    <span className="bg-white text-gray-900 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-200 flex items-center gap-1 shrink-0">
                                        <MapPin className="w-3 h-3" />
                                        {scheme.state === 'Central' ? 'Central Govt' : `${scheme.state}`}
                                    </span>
                                </div>

                                <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight break-words">
                                    {scheme.title}
                                </h1>

                                {(() => {
                                    const paragraphs = scheme.description.split('\n').filter(p => p.trim());
                                    const slides = [];
                                    for (let i = 0; i < paragraphs.length; i += 2) {
                                        slides.push(paragraphs.slice(i, i + 2));
                                    }

                                    return (
                                        <div className="mb-8">
                                            <div className="relative bg-[#f8f9fa] rounded-2xl p-4 sm:p-8 min-h-[200px] border border-gray-100 flex flex-col justify-between w-full overflow-hidden">
                                                <div className="text-sm sm:text-lg text-gray-700 leading-relaxed font-medium space-y-4 break-words">
                                                    {slides[currentSlide]?.map((paragraph, index) => (
                                                        <p key={index}>{paragraph.trim()}</p>
                                                    ))}
                                                </div>

                                                {slides.length > 1 && (
                                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                                        <button
                                                            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                                            disabled={currentSlide === 0}
                                                            className="flex items-center gap-1 text-sm font-bold text-gray-900 disabled:opacity-40 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            ← Previous
                                                        </button>
                                                        <div className="flex gap-2">
                                                            {slides.map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => setCurrentSlide(idx)}
                                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? 'bg-gray-900 w-8' : 'bg-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                                                            disabled={currentSlide === slides.length - 1}
                                                            className="flex items-center gap-1 text-sm font-bold text-gray-900 disabled:opacity-40 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                                                        >
                                                            Next →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Benefit Type</div>
                                        <div className="font-bold text-gray-900">Financial</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Mode</div>
                                        <div className="font-bold text-gray-900">Online</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Deadline</div>
                                        <div className="font-bold text-gray-900">N/A</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Sponsor</div>
                                        <div className="font-bold text-gray-900">{scheme.ministry || "Govt"}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'benefits' && (
                            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                                        <Gift className="w-5 h-5" />
                                    </span>
                                    Benefits & Amount
                                </h2>
                                <div className="prose prose-gray max-w-none">
                                    <div className="bg-[#f8f9fa] p-6 rounded-2xl border border-gray-100 mb-6">
                                        <ul className="space-y-4">
                                            {scheme.benefits.split('\n').map((benefit: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                                                    </div>
                                                    <span className="text-gray-700 font-medium leading-relaxed">{benefit.replace(/^- /, '')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'eligibility' && (
                            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                                        <CheckCircle className="w-5 h-5" />
                                    </span>
                                    Similarity Check
                                </h2>
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-900 animate-pulse"></div>
                                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider">AI Eligibility Analysis</h3>
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-700 font-medium break-words">
                                        {eligibilityLoading ? (
                                            <span className="animate-pulse bg-gray-200 text-transparent px-2 rounded">Analyzing your profile against scheme guidelines... this may take a few moments.</span>
                                        ) : eligibilityData ? (
                                            <>Based on your profile, you have a <span className={`font-black bg-white border border-gray-200 px-2 py-0.5 rounded whitespace-nowrap ${eligibilityData.chance === 'High' ? 'text-green-600' : 'text-gray-900'}`}>{eligibilityData.chance} Chance</span> of being eligible for this scheme.</>
                                        ) : (
                                            "Please login or update your profile to view full AI analysis."
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {eligibilityLoading ? (
                                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                                            <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Mistral AI is checking criteria...</p>
                                        </div>
                                    ) : eligibilityData ? (
                                        eligibilityData.criteria.map((crit, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <span className="font-bold text-gray-700">{crit.label}</span>
                                                <span className={`font-bold flex items-center gap-1 flex-shrink-0 ml-2 ${crit.match ? 'text-green-600' : 'text-red-500'}`}>
                                                    {crit.match ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : (
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    <span className="text-xs sm:text-sm">{crit.match ? 'Match' : 'Unmatched'}</span>
                                                </span>
                                            </div>
                                        ))
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {activeSection === 'documents' && (
                            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 flex-shrink-0">
                                        <Files className="w-5 h-5" />
                                    </span>
                                    Required Documents
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['Aadhar Card', 'Income Certificate', 'Caste Certificate', 'Bank Passbook', 'Passport Photo', 'Previous Marksheet'].map((doc, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <span className="font-bold text-gray-700">{doc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'apply' && (
                            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                                        <Rocket className="w-5 h-5" />
                                    </span>
                                    Ready to Apply?
                                </h2>

                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center mb-8">
                                    <p className="text-gray-900 font-bold text-lg mb-2">Proceed to Official Portal</p>
                                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">You will be redirected to the official government website to complete your application.</p>
                                    <button className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 mx-auto">
                                        Apply Now on Official Website
                                        <Globe className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900">Application Steps:</h3>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Register on Portal</p>
                                            <p className="text-sm text-gray-500">Create an account using your Aadhar and Mobile number.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">2</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Fill Application Form</p>
                                            <p className="text-sm text-gray-500">Enter your personal, academic, and bank details accurately.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">3</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Upload Documents</p>
                                            <p className="text-sm text-gray-500">Upload scanned copies of required documents in PDF/JPG format.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </main>
    );
}
