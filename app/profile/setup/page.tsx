"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
    name: string;
    email: string;
    mobile: string;
    dob: string;
    gender: string;
    category: string;
    income: string;
    occupation: string;
    role: string;
    location: string;
    aadhar: string;
    pan: string;
    fatherName: string;
    fatherProfession: string;
    motherName: string;
    motherProfession: string;
    documents: string[];
    appliedSchemes: any[];
    savedSchemes: any[];
}

export default function ProfileSetupPage() {
    const router = useRouter();
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize state with auth user data if available
    const [user, setUser] = useState<UserProfile>({
        name: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        category: "General",
        income: "",
        occupation: "",
        role: "User",
        location: "",
        aadhar: "",
        pan: "",
        fatherName: "",
        fatherProfession: "",
        motherName: "",
        motherProfession: "",
        documents: [],
        appliedSchemes: [],
        savedSchemes: []
    });

    useEffect(() => {
        if (authUser) {
            // Only populate if local state is empty to avoid overwriting user edits
            // or just spread existing authUser data
            setUser(prev => ({
                ...prev,
                // spread authUser but filter out nulls/undefined if needed
                ...(authUser as any),
                mobile: (authUser as any).mobile || "",
                dob: (authUser as any).dob || "",
                gender: (authUser as any).gender || "",
                category: (authUser as any).category || "",
                income: (authUser as any).income || "",
                occupation: (authUser as any).occupation || "",
                location: (authUser as any).location || "",
                aadhar: (authUser as any).aadhar || "",
                pan: (authUser as any).pan || "",
                fatherName: (authUser as any).fatherName || "",
                fatherProfession: (authUser as any).fatherProfession || "",
                motherName: (authUser as any).motherName || "",
                motherProfession: (authUser as any).motherProfession || "",
                role: (authUser as any).role || "User",
                // Ensure array fields are arrays
                documents: (authUser as any).documents || [],
                appliedSchemes: (authUser as any).appliedSchemes || [],
                savedSchemes: (authUser as any).savedSchemes || []
            }));
        }
    }, [authUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // We can create a dedicated profile update API endpoint
            // For now, let's assume register handles initial data, 
            // but we need an UPDATE endpoint for profile completion.
            // I will create /api/user/update next.
            const res = await fetch("/api/user/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });

            if (!res.ok) throw new Error("Failed to update profile");

            const data = await res.json();
            setAuthUser(data.user);
            alert("Profile Setup Complete!");
            router.push("/profile");
        } catch (error) {
            console.error(error);
            alert("Error saving profile");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const steps = [
        { title: "Identity", icon: "🆔" },
        { title: "Personal", icon: "👤" },
        { title: "Family", icon: "👨‍👩‍👧" },
        { title: "Contact", icon: "📞" },
        { title: "Financial", icon: "💰" }
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 bg-gray-50 flex justify-center items-center px-4">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up border border-gray-100 min-h-[600px]">

                {/* Sidebar Steps (Desktop) */}
                <div className="w-full md:w-1/3 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full -ml-32 -mb-32 opacity-50"></div>

                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
                        <p className="text-slate-400 text-sm mb-12">Fill in your details to get personalized scheme recommendations.</p>

                        <div className="space-y-6">
                            {steps.map((step, idx) => (
                                <div key={idx} className={`flex items-center gap-4 ${currentStep === idx + 1 ? "opacity-100" : "opacity-40"}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all ${currentStep === idx + 1 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50" : "bg-slate-800 text-slate-400"}`}>
                                        {currentStep > idx + 1 ? "✓" : idx + 1}
                                    </div>
                                    <span className="font-medium tracking-wide text-sm md:text-base">{step.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>

                {/* Steps Content */}
                <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                        <div className="mb-8">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block">Step {currentStep}</span>
                            <h2 className="text-3xl font-bold text-gray-900">{steps[currentStep - 1].title} Details</h2>
                        </div>

                        <div className="space-y-6">
                            {currentStep === 1 && (
                                <div className="animate-fade-in">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Aadhar Number</label>
                                            <input name="aadhar" value={user.aadhar} onChange={handleInputChange} placeholder="XXXX XXXX XXXX" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">PAN Number</label>
                                            <input name="pan" value={user.pan} onChange={handleInputChange} placeholder="ABCDE1234F" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                                        <span className="text-xl">ℹ️</span>
                                        <p>We encrypt your identity documents securely. They are only used for eligibility verification.</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="animate-fade-in space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                        <input name="name" value={user.name} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                                            <input type="date" name="dob" value={user.dob} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium text-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                                            <select name="gender" value={user.gender} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium text-gray-600">
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Social Category</label>
                                        <select name="category" value={user.category} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium text-gray-600">
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="animate-fade-in space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Father's Name</label>
                                            <input name="fatherName" value={user.fatherName} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Profession</label>
                                            <input name="fatherProfession" value={user.fatherProfession} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Mother's Name</label>
                                            <input name="motherName" value={user.motherName} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Profession</label>
                                            <input name="motherProfession" value={user.motherProfession} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="animate-fade-in space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input type="email" name="email" value={user.email} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
                                            <input type="tel" name="mobile" value={user.mobile} onChange={handleInputChange} className="w-full pl-12 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Current Location</label>
                                        <input name="location" value={user.location} onChange={handleInputChange} placeholder="City, State" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="animate-fade-in space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Annual Family Income (₹)</label>
                                        <input type="number" name="income" value={user.income} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Current Occupation</label>
                                        <select name="occupation" value={user.occupation} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-medium text-gray-600">
                                            <option value="">Select Occupation</option>
                                            <option value="Farmer">Farmer</option>
                                            <option value="Student">Student</option>
                                            <option value="Business">Business Owner</option>
                                            <option value="Employed">Salaried / Self Employed</option>
                                            <option value="Unemployed">Unemployed</option>
                                            <option value="Housewife">Homemaker</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 mt-4">
                                        <h4 className="font-bold text-green-800 mb-1">Almost Done!</h4>
                                        <p className="text-sm text-green-700">Click Finish to save your profile and see your eligibility score.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        {currentStep > 1 ? (
                            <button onClick={prevStep} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {currentStep < 5 ? (
                            <button onClick={nextStep} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1">
                                Next Step &rarr;
                            </button>
                        ) : (
                            <button onClick={handleSave} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all hover:-translate-y-1">
                                Finish Setup ✨
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
