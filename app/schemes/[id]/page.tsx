"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, use } from "react"; // Add 'use' hook
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Scheme Not Found 😕</h1>
                <p className="text-gray-600 mb-6">The scheme you are looking for might have been removed or does not exist.</p>
                <Link href="/schemes" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors">
                    Browse All Schemes
                </Link>
            </div>
        );
    }

    const isEligible = true; // TODO: Implement eligibility check logic later

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-20">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-900 via-slate-900 to-black -z-10"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="mb-8 text-sm text-blue-200 font-medium">
                    <Link href="/schemes" className="hover:text-white transition-colors">Schemes</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white opacity-80">{scheme.title}</span>
                </div>

                <div className="grid lg:grid-cols-4 gap-8 items-start">

                    {/* Left Column: Navigation (Tabs) */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-24">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Scheme Details</h3>
                            </div>
                            <nav className="flex flex-col p-2 space-y-1">
                                {[
                                    { id: 'overview', label: 'Overview & Details', icon: '📝' },
                                    { id: 'benefits', label: 'Benefits & Amount', icon: '🎁' },
                                    { id: 'eligibility', label: 'Eligibility Criteria', icon: '✅' },
                                    { id: 'documents', label: 'Required Documents', icon: '📄' },
                                    { id: 'apply', label: 'Apply Now', icon: '🚀' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${activeSection === item.id
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Middle Column: Active Content */}
                    <div className="lg:col-span-3 space-y-8 min-h-[500px]">

                        {/* Mobile Tabs (Visible only on small screens) */}
                        <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                            {[
                                { id: 'overview', label: 'Overview', icon: '📝' },
                                { id: 'benefits', label: 'Benefits', icon: '🎁' },
                                { id: 'eligibility', label: 'Eligibility', icon: '✅' },
                                { id: 'documents', label: 'Documents', icon: '📄' },
                                { id: 'apply', label: 'Apply', icon: '🚀' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border ${activeSection === item.id
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {activeSection === 'overview' && (
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                        {scheme.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${scheme.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {scheme.status}
                                    </span>
                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100">
                                        {scheme.state === 'Central' ? '🇮🇳 Central Govt' : `📍 ${scheme.state}`}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
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
                                            <div className="relative bg-blue-50/50 rounded-2xl p-6 min-h-[200px] border border-blue-100 flex flex-col justify-between">
                                                <div className="text-lg text-gray-700 leading-relaxed font-medium space-y-4">
                                                    {slides[currentSlide]?.map((paragraph, index) => (
                                                        <p key={index}>{paragraph.trim()}</p>
                                                    ))}
                                                </div>

                                                {slides.length > 1 && (
                                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-200/30">
                                                        <button
                                                            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                                            disabled={currentSlide === 0}
                                                            className="flex items-center gap-1 text-sm font-bold text-blue-700 disabled:opacity-40 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            ← Previous
                                                        </button>
                                                        <div className="flex gap-1.5">
                                                            {slides.map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => setCurrentSlide(idx)}
                                                                    className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-blue-600 w-6' : 'bg-blue-200'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                                                            disabled={currentSlide === slides.length - 1}
                                                            className="flex items-center gap-1 text-sm font-bold text-blue-700 disabled:opacity-40 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Next →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-4 py-2 rounded-lg w-fit">
                                    <span>🏛️ Provided by:</span>
                                    <span className="text-gray-900 font-bold">{scheme.ministry} </span>
                                </div>
                            </div>
                        )}

                        {activeSection === 'benefits' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="text-2xl">🎁</span> Scheme Benefits
                                </h2>
                                <div className="prose prose-blue max-w-none text-gray-600 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    <div className="space-y-4 text-lg">
                                        {scheme.benefits.split('\n').map((paragraph, index) => (
                                            paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
                                        ))}
                                    </div>
                                    {scheme.amount && (
                                        <div className="mt-6 pt-6 border-t border-blue-200/50 flex items-center gap-4 bg-white/50 p-4 rounded-xl">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">💰</div>
                                            <div>
                                                <div className="text-sm text-blue-600 font-bold uppercase tracking-wide">Financial Assistance</div>
                                                <div className="text-3xl font-black text-gray-900">₹{scheme.amount.toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'eligibility' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="text-2xl">✅</span> Eligibility Criteria
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Income Limit</span>
                                        <div className="font-bold text-gray-900 mt-1 text-lg">
                                            {scheme.incomeLimit ? `Up to ₹${scheme.incomeLimit.toLocaleString('en-IN')} /Year` : 'No Limit'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age Group</span>
                                        <div className="font-bold text-gray-900 mt-1 text-lg">
                                            {scheme.ageMin && scheme.ageMax ? `${scheme.ageMin} - ${scheme.ageMax} Years` : 'No Restriction'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</span>
                                        <div className="font-bold text-gray-900 mt-1 text-lg">{scheme.gender}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</span>
                                        <div className="font-bold text-gray-900 mt-1 text-lg">
                                            {scheme.caste && scheme.caste.length > 0 ? scheme.caste.join(", ") : "All"}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                    <div className="flex items-start gap-4">
                                        <div className="text-2xl">⚠️</div>
                                        <div>
                                            <h3 className="font-bold text-yellow-900 mb-2 text-sm uppercase tracking-wider">Specific Requirements</h3>
                                            <div className="text-yellow-900 text-base leading-relaxed space-y-2">
                                                {scheme.eligibility.split('\n').map((paragraph, index) => (
                                                    paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'documents' && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="text-2xl">📄</span> Required Documents
                                </h2>
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                                    <p className="text-blue-800 font-medium">Please ensure you have valid copies of the following documents before applying.</p>
                                </div>
                                <ul className="grid gap-3">
                                    {scheme.documentsRequired && scheme.documentsRequired.map((doc, idx) => (
                                        <li key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 text-gray-700 font-bold shadow-sm hover:border-blue-300 transition-colors">
                                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600">
                                                {idx + 1}
                                            </div>
                                            {doc}
                                        </li>
                                    ))}
                                    {(!scheme.documentsRequired || scheme.documentsRequired.length === 0) && (
                                        <li className="text-gray-500 italic">No specific documents listed.</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {activeSection === 'apply' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Header Section */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="text-2xl">🚀</span> Application Process
                                    </h2>

                                    {scheme.status === 'active' ? (
                                        <>
                                            {/* Steps Timeline */}
                                            <div className="relative mb-8 px-4">
                                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-100 hidden md:block"></div>
                                                <div className="space-y-8">
                                                    <div className="flex flex-col md:flex-row gap-6 relative">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-50 border-4 border-white shadow-sm rounded-full flex items-center justify-center text-2xl z-10">
                                                            📝
                                                        </div>
                                                        <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                            <h3 className="font-bold text-gray-900 mb-2">1. Check Eligibility & Documents</h3>
                                                            <p className="text-gray-600 text-sm">Ensure you meet all the criteria listed in the <strong>Eligibility</strong> tab and have digital copies of all <strong>Required Documents</strong> ready.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-6 relative">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-50 border-4 border-white shadow-sm rounded-full flex items-center justify-center text-2xl z-10">
                                                            🔐
                                                        </div>
                                                        <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                            <h3 className="font-bold text-gray-900 mb-2">2. Register / Login</h3>
                                                            <p className="text-gray-600 text-sm">Create an account on the Sangam portal or log in if you already have one to track your application status.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-6 relative">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 border-4 border-white shadow-sm rounded-full flex items-center justify-center text-2xl z-10">
                                                            🚀
                                                        </div>
                                                        <div className="flex-1 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                                            <h3 className="font-bold text-blue-900 mb-2">3. Submit Application</h3>
                                                            <p className="text-blue-700 text-sm">Fill out the application form on the official website (or via Sangam's quick apply features where available).</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Action Area */}
                                            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-xl shadow-blue-900/20">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

                                                <div className="relative z-10 max-w-2xl mx-auto">
                                                    <h3 className="text-2xl font-bold mb-4">Ready to Launch Your Dreams?</h3>
                                                    <p className="text-blue-200 mb-8 leading-relaxed">
                                                        You are just one step away from accessing these benefits. Click the button below to start your application journey.
                                                    </p>

                                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                        {user ? (
                                                            <button className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:-translate-y-1 hover:shadow-xl">
                                                                Start Application Now 🚀
                                                            </button>
                                                        ) : (
                                                            <Link href="/login" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1">
                                                                Login to Apply 🔐
                                                            </Link>
                                                        )}
                                                        {scheme.applicationUrl && (
                                                            <a
                                                                href={scheme.applicationUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all"
                                                            >
                                                                Visit Official Portal ↗
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                                    <div className="text-2xl mb-1">📅</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Deadline</div>
                                                    <div className="font-bold text-gray-900 mt-1">
                                                        {scheme.deadline ? new Date(scheme.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                                    <div className="text-2xl mb-1">👥</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Applicants</div>
                                                    <div className="font-bold text-gray-900 mt-1">12.5k+</div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                                    <div className="text-2xl mb-1">⏱️</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Processing</div>
                                                    <div className="font-bold text-gray-900 mt-1">~30 Days</div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                                    <div className="text-2xl mb-1">📞</div>
                                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Helpline</div>
                                                    <div className="font-bold text-gray-900 mt-1">1091</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-12 bg-red-50 border border-red-100 rounded-3xl text-center">
                                            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🚫</div>
                                            <h3 className="text-2xl font-bold text-red-800 mb-3">Applications Closed</h3>
                                            <p className="text-red-700 max-w-md mx-auto">
                                                The application window for this scheme is currently closed. You can subscribe to notifications to be alerted when it reopens.
                                            </p>
                                            <button className="mt-6 px-6 py-3 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
                                                Notify Me When It Opens 🔔
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main >
    );
}
