"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, Search, Zap, CheckCircle, FileText, Bell, Users, BarChart, MapPin, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen relative bg-[#111111] text-white overflow-x-hidden font-sans selection:bg-white/20">

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Dark plus grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1a1a1a,transparent)]"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full h-full gap-12 pb-20 md:pb-0">

          {/* Left Content */}
          <div className="w-full md:w-1/2 text-left space-y-8 animate-fade-in-up pt-12 md:pt-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-sm shadow-sm">
              <Zap size={14} className="fill-white text-white" />
              <span>AI-Powered Matching</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Empower Your Future <br />
              <span className="text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white">With Sangam AI</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
              Discover, Apply, and Track thousands of government opportunities tailored just for you. No paperwork chaos, just plain results.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href={user ? "/schemes" : "/register"} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2 transform hover:scale-105 shadow-lg shadow-white/10">
                <Zap size={20} className="fill-black" /> Get Started
              </Link>
              <Link href="/schemes" className="px-8 py-4 bg-transparent border border-gray-600 text-white rounded-full font-bold text-lg hover:bg-white/5 hover:border-white transition-all flex items-center gap-2 hover:scale-105">
                <Search size={20} /> Explore Schemes
              </Link>
            </div>

            <div className="flex gap-12 pt-8 border-t border-white/10 mt-16">
              <div>
                <div className="text-3xl font-bold text-white">850+</div>
                <div className="text-gray-500 text-sm font-medium mt-1">Schemes Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-gray-500 text-sm font-medium mt-1">Free</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">AI</div>
                <div className="text-gray-500 text-sm font-medium mt-1">Powered</div>
              </div>
            </div>
          </div>

          {/* Right Visual - 3D Graphic */}
          <div className="w-full md:w-1/2 relative flex justify-center md:justify-end items-center h-[500px] md:pr-12">
            {/* 3D-like graphic using CSS/Icons */}
            <div className="relative w-full max-w-[500px] aspect-square animate-float">

              {/* Center Graphic - Changed to Landmark for Government Schemes */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-500" style={{ transform: `translate(-50%, calc(-50% + ${scrollY * -0.05}px))` }}>
                {/* Using GraduationCap as main visual still looks sleek, or maybe Landmark? Let's use Landmark for Sangam context */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
                  <Landmark size={280} className="text-gray-100 drop-shadow-2xl relative z-10" strokeWidth={0.8} />
                </div>
              </div>

              {/* Glow behind Graphic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] -z-10"></div>

              {/* Floating Badge: 95% Match */}
              <div className="absolute bottom-[20%] right-0 md:-right-4 bg-white text-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-float z-20 hover:scale-110 transition-transform cursor-default border border-white/50" style={{ animationDelay: '1.5s' }}>
                <Zap className="text-amber-500 fill-amber-100" size={24} />
                <div>
                  <span className="font-bold text-sm block">95% Match</span>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-10 text-gray-700 animate-pulse delay-700">+</div>
              <div className="absolute bottom-10 left-10 text-gray-700 animate-pulse delay-300">+</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHY CHOOSE SANGAM (Previously Bento Grid Features) */}
      <section className="bg-[#f3f0e9] py-32 text-gray-900 relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider mb-6 bg-[#333] text-white">Why Choose Us</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Sangam?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Driven Matching",
                desc: "Our advanced algorithms analyze your profile against thousands of criteria to find schemes you actually qualify for.",
                icon: <Zap size={32} className="text-white" />,
                bg: "bg-black"
              },
              {
                title: "Instant Updates",
                desc: "Get notified immediately when new schemes are launched or deadlines approach.",
                icon: <Bell size={32} className="text-white" />,
                bg: "bg-gray-800"
              },
              {
                title: "Vernacular Support",
                desc: "Access tailored content in 12+ regional languages, making valid information accessible to everyone.",
                icon: <FileText size={32} className="text-white" />,
                bg: "bg-gray-700"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative group hover:translate-y-[-5px] transition-all duration-300 h-full flex flex-col">
                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-8 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                  {item.icon}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRENDING SCHEMES (White Mode) */}
      <section className="py-24 bg-white border-t border-gray-100 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4">Trending Now</h2>
              <p className="text-gray-500 text-lg">Most applied schemes this week</p>
            </div>
            <Link href="/schemes" className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center gap-2">View All <ArrowRight size={18} /></Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Mudra Loan", cat: "Business", amount: "₹10 Lakh", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
              { title: "Awas Yojana", cat: "Housing", amount: "₹2.5 Lakh", gradient: "from-purple-500 to-pink-600", bg: "bg-purple-50" },
              { title: "Skill India", cat: "Education", amount: "Free Training", gradient: "from-orange-500 to-red-600", bg: "bg-orange-50" }
            ].map((item, idx) => (
              <div key={idx} className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
                {/* Background with slight tint */}
                <div className={`absolute inset-0 ${item.bg} opacity-30`}></div>

                {/* Gradient Header Overlay */}
                <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <span className="bg-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm border border-gray-100">{item.cat}</span>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-black transition-colors shadow-sm cursor-pointer hover:bg-gray-50">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2 text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 font-medium text-lg">{item.amount} Benefit</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-32 bg-[#f9fafb] text-center border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-gray-900">
            Ready to Claim Your Benefits?
          </h2>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
            Join 10 Million+ Indians who have already found their path to prosperity.
          </p>
          <Link href={user ? "/profile" : "/register"} className="inline-block px-12 py-5 bg-black text-white rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl hover:shadow-xl">
            {user ? "Go to Dashboard" : "Get Started Now"}
          </Link>
        </div>
      </section>

    </main>
  );
}
