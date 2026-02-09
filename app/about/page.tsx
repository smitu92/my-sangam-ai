"use client";

import Image from "next/image";

export default function AboutPage() {
    return (
        <main className="w-full pt-32 pb-20 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block mb-4">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Last Mile Bridge</span> for Welfare
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Sangam AI was born from a simple observation: India has 2,500+ welfare schemes, yet millions miss out due to lack of awareness. We use AI to solve this information gap.
                    </p>
                </div>

                {/* Hero Illustration / Values */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20 animate-fade-in-up animate-delay-200">
                    <div className="space-y-8">
                        {[
                            { title: "Transparency", desc: "No hidden fees. Free forever for citizens.", icon: "🔍", color: "bg-blue-100 text-blue-600" },
                            { title: "Accessibility", desc: "Available in 12+ regional languages.", icon: "🌐", color: "bg-green-100 text-green-600" },
                            { title: "Smart Tech", desc: "Matching 1.4B people to 2.5K schemes accurately.", icon: "🤖", color: "bg-purple-100 text-purple-600" }
                        ].map((val, idx) => (
                            <div key={idx} className="flex gap-6 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:bg-gray-50">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${val.color} flex-shrink-0`}>
                                    {val.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{val.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-center animate-scale-in">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <h2 className="text-3xl font-bold mb-6 relative z-10">Our Impact So Far</h2>
                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div>
                                <div className="text-4xl font-extrabold mb-1">50K+</div>
                                <p className="text-blue-100 text-sm opacity-80">Schemes Discovered</p>
                            </div>
                            <div>
                                <div className="text-4xl font-extrabold mb-1">₹12Cr</div>
                                <p className="text-blue-100 text-sm opacity-80">Benefits Unlocked</p>
                            </div>
                            <div>
                                <div className="text-4xl font-extrabold mb-1">100+</div>
                                <p className="text-blue-100 text-sm opacity-80">Volunteers</p>
                            </div>
                            <div>
                                <div className="text-4xl font-extrabold mb-1">24/7</div>
                                <p className="text-blue-100 text-sm opacity-80">AI Support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Teaser */}
                <div className="text-center bg-gray-50 rounded-3xl p-12 animate-fade-in-up animate-delay-300">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by Team Antigravity</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        A group of passionate engineers, designers, and policy experts working together to build digital public infrastructure.
                    </p>
                    <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all border border-gray-200 hover:-translate-y-1">
                        Join Our Mission
                    </button>
                </div>
            </div>
        </main>
    );
}
