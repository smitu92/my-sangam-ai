"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#0F172A] text-white selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden font-sans">

      {/* 1. HERO SECTION REACTIVE */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20 overflow-hidden">

        {/* Animated Background Grid - Parallax */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e293b,transparent)]"></div>
        </div>

        {/* Hero Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000 z-0"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1] animate-fade-in-up pt-12 md:pt-16 drop-shadow-2xl">
            Empower Your Future<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
              With Sangam AI
            </span>
          </h1>

          {/* Badge */}
          <div className="mb-10 animate-fade-in-up animate-delay-200">
            <span className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-full px-6 py-2.5 text-sm md:text-base font-medium text-blue-300 shadow-xl ring-1 ring-white/10 hover:ring-blue-500/50 transition-all cursor-default">
              ✨ Making Government Schemes Accessible
            </span>
          </div>

          {/* Subtext */}
          <p className="max-w-2xl text-lg md:text-2xl text-slate-400 mb-12 leading-relaxed animate-fade-in-up animate-delay-300">
            Discover, Apply, and Track thousands of government opportunities tailored just for you. No paperwork chaos, just plain results.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center animate-fade-in-up animate-delay-500">
            <Link href="/schemes" className="group relative px-10 py-5 bg-blue-600 rounded-full font-extrabold text-xl text-white shadow-xl shadow-blue-500/25 overflow-hidden transition-all hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-3">
                Find My Schemes <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link href="/about" className="px-10 py-5 bg-slate-800/50 backdrop-blur-md border border-slate-700 text-white rounded-full font-extrabold text-xl hover:bg-slate-700/50 transition-all hover:scale-105 active:scale-95">
              Watch Demo
            </Link>
          </div>

          {/* Dashboard Preview / Floating UI */}
          <div className="mt-20 w-full max-w-5xl animate-fade-in-up animate-delay-500 perspective-1000 overflow-visible">
            <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl shadow-2xl transition-transform duration-500 h-full"
              style={{ transform: `rotateX(5deg) translateY(${scrollY * -0.05}px)` }}>
              {/* Mock Browser Header */}
              <div className="h-12 bg-slate-800/50 border-b border-slate-700/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="ml-4 h-6 bg-slate-700/50 flex-1 rounded-md max-w-sm"></div>
              </div>
              {/* Mock Content */}
              <div className="p-8 grid md:grid-cols-3 gap-6 text-left">
                <div className="col-span-2 space-y-4">
                  <div className="h-40 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 p-6 flex flex-col justify-end">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center text-xl">🚀</div>
                    <div className="h-4 w-32 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 w-48 bg-slate-700/50 rounded"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-24 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 mb-2"></div>
                      <div className="h-2 w-16 bg-slate-600 rounded"></div>
                    </div>
                    <div className="flex-1 h-24 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 mb-2"></div>
                      <div className="h-2 w-16 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-md bg-slate-700/50"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-20 bg-slate-600 rounded"></div>
                        <div className="h-2 w-12 bg-slate-700/50 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: "Active Users", value: "2M+", color: "text-blue-600" },
              { label: "Schemes Listed", value: "850+", color: "text-purple-600" },
              { label: "Money Disbursed", value: "₹500Cr", color: "text-green-600" },
              { label: "Districts Covered", value: "720+", color: "text-orange-600" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className={`text-3xl md:text-5xl font-black ${stat.color} mb-1 tracking-tight`}>{stat.value}</div>
                <div className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES */}
      <section className="py-32 px-4 relative bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20">
            Why Choose <span className="text-blue-600">Sangam?</span>
          </h2>

          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Large Item */}
            <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] group-hover:bg-blue-100 transition-all"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-blue-600/20 text-white">🤖</div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">AI-Driven Matching</h3>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Our advanced algorithms analyze your profile against thousands of criteria to find schemes you actually qualify for. No more guessing games.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span> Match Found: PM Kisan Samman Nidhi
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                    <span className="text-green-500 font-bold">✓</span> Match Found: National Scholarship
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Item 2 */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-purple-900/5 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-2xl text-purple-600">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Instant Updates</h3>
                  <p className="text-slate-500">Get notified immediately when new schemes are launched or deadlines approach.</p>
                </div>
              </div>
            </div>

            {/* Small Item 3 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-green-900/5 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-4 text-green-600">🌍</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Vernacular Support</h3>
              <p className="text-slate-500 text-sm">Access tailored content in 12+ regional languages.</p>
            </div>

            {/* Small Item 4 */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-orange-900/5 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4 text-orange-600">📄</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Doc Locker</h3>
              <p className="text-slate-500 text-sm">Securely store and verify your documents on the cloud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREVIEW SCHEMES (White Mode) */}
      <section className="py-24 bg-white border-y border-gray-100 text-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Trending Now</h2>
              <p className="text-slate-500">Most applied schemes this week</p>
            </div>
            <Link href="/schemes" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">View All &rarr;</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Reusing existing Scheme Card Logic with Lighter Colors */}
            {[
              { title: "Mudra Loan", cat: "Business", amount: "₹10 Lakh", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
              { title: "Awas Yojana", cat: "Housing", amount: "₹2.5 Lakh", gradient: "from-purple-500 to-pink-600", bg: "bg-purple-50" },
              { title: "Skill India", cat: "Education", amount: "Free Training", gradient: "from-orange-500 to-red-600", bg: "bg-orange-50" }
            ].map((item, idx) => (
              <div key={idx} className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                {/* Background with slight tint */}
                <div className={`absolute inset-0 ${item.bg} opacity-50`}></div>
                {/* Gradient Header Overlay */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm">{item.cat}</span>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors shadow-sm">↗</div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1 text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-slate-600 font-medium">{item.amount} Benefit</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION (Lighter) */}
      <section className="py-32 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-blue-100/50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-gray-900">Ready to Claim Your Benefits?</h2>
          <p className="text-xl text-slate-600 mb-12">Join 10 Million+ Indians who have already found their path to prosperity.</p>
          <Link href={user ? "/profile" : "/register"} className="inline-block px-12 py-5 bg-blue-600 text-white rounded-full font-black text-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-blue-600/40">
            {user ? "Go to Dashboard" : "Get Started Now"}
          </Link>
        </div>
      </section>

    </main>
  );
}
