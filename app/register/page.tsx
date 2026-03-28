"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/* ── Enum options (mirror prisma/zod/Userprofile.schema.ts) ── */
const GENDERS = ["Male", "Female", "Other"] as const;
const CASTES = ["General", "OBC", "SC", "ST", "EWS"] as const;
const RATION_CARDS = ["APL", "BPL", "AAY", "None"] as const;
const OCCUPATIONS = [
    "Student", "Farmer", "Teacher", "Researcher",
    "Business", "SmallBusiness", "DairyFarm",
    "JobSeeker", "SelfEmployed", "Other",
] as const;
const EDUCATION_LEVELS = [
    "Below10th", "Class10th", "Class12th", "ITI",
    "Diploma", "Graduate", "Postgraduate", "PhD", "Other",
] as const;
const INSTITUTION_TYPES = [
    "Government", "Private", "CentralUniversity", "StateUniversity", "Other",
] as const;

/* ── Helper: human-readable labels ────────────────────────── */
function humanize(s: string) {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim();
}

/* ── Types ─────────────────────────────────────────────────── */
interface FormData {
    // Step 1 — Account
    name: string; email: string; password: string;
    // Step 2 — Personal
    age: string; gender: string; state: string; district: string;
    caste: string; annualIncome: string; disability: boolean;
    disabilityType: string; rationCard: string; religion: string;
    // Step 3 — Occupation
    occupation: string;
    // Student/Teacher/Researcher
    educationLevel: string; institutionType: string; courseName: string;
    yearOfStudy: string; marksPercentage: string; experienceYears: string;
    // Farmer/Dairy
    landSizeAcres: string; landOwnership: boolean; cropType: string;
    irrigationAccess: boolean; animalCount: string; animalType: string;
    // Business/MSME
    businessType: string; gstRegistered: boolean; msmeRegistered: boolean;
    udyamNumber: string; employeeCount: string; annualTurnover: string;
}

const INITIAL: FormData = {
    name: "", email: "", password: "",
    age: "", gender: "", state: "", district: "",
    caste: "General", annualIncome: "", disability: false,
    disabilityType: "", rationCard: "None", religion: "",
    occupation: "",
    educationLevel: "", institutionType: "", courseName: "",
    yearOfStudy: "", marksPercentage: "", experienceYears: "",
    landSizeAcres: "", landOwnership: false, cropType: "",
    irrigationAccess: false, animalCount: "", animalType: "",
    businessType: "", gstRegistered: false, msmeRegistered: false,
    udyamNumber: "", employeeCount: "", annualTurnover: "",
};

/* ── Validation ───────────────────────────────────────────── */
function validateStep(step: number, d: FormData): Record<string, string> {
    const e: Record<string, string> = {};
    if (step === 1) {
        if (!d.name || d.name.length < 2) e.name = "Name must be at least 2 characters";
        if (!d.email || !/\S+@\S+\.\S+/.test(d.email)) e.email = "Valid email is required";
        if (!d.password || d.password.length < 6) e.password = "Password must be at least 6 characters";
    }
    if (step === 2) {
        if (!d.age || isNaN(Number(d.age)) || Number(d.age) < 1 || Number(d.age) > 120) e.age = "Age must be 1-120";
        if (!d.gender) e.gender = "Gender is required";
        if (!d.state) e.state = "State is required";
        if (!d.district) e.district = "District is required";
        if (!d.annualIncome || isNaN(Number(d.annualIncome)) || Number(d.annualIncome) < 0) e.annualIncome = "Valid income is required";
        if (d.disability && !d.disabilityType) e.disabilityType = "Please specify disability type";
    }
    if (step === 3) {
        if (!d.occupation) e.occupation = "Occupation is required";
        const occ = d.occupation;
        if (occ === "Student") {
            if (!d.educationLevel) e.educationLevel = "Required";
            if (!d.institutionType) e.institutionType = "Required";
            if (!d.courseName) e.courseName = "Required";
            if (!d.yearOfStudy || Number(d.yearOfStudy) < 1) e.yearOfStudy = "Required (1-7)";
        }
        if (occ === "Teacher" || occ === "Researcher") {
            if (!d.educationLevel) e.educationLevel = "Required";
            if (!d.institutionType) e.institutionType = "Required";
            if (!d.experienceYears && d.experienceYears !== "0") e.experienceYears = "Required";
        }
        if (occ === "Farmer") {
            if (!d.landSizeAcres && d.landSizeAcres !== "0") e.landSizeAcres = "Required";
            if (!d.cropType) e.cropType = "Required";
        }
        if (occ === "DairyFarm") {
            if (!d.animalCount || Number(d.animalCount) < 1) e.animalCount = "At least 1";
            if (!d.animalType) e.animalType = "Required";
        }
        if (occ === "Business" || occ === "SmallBusiness") {
            if (!d.businessType) e.businessType = "Required";
        }
        if (occ === "JobSeeker") {
            if (!d.educationLevel) e.educationLevel = "Required";
        }
    }
    return e;
}

/* ── Reusable Styled Components ───────────────────────────── */
const inputCls = "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium";
const selectCls = inputCls + " appearance-none";
const labelCls = "block text-sm font-bold text-gray-700 mb-2";
const errorCls = "text-red-500 text-xs mt-1 font-semibold";

function Field({ label, error, id, children }: { label: string; error?: string; id?: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className={labelCls}>{label}</label>
            {children}
            {error && <p className={errorCls}>{error}</p>}
        </div>
    );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(INITIAL);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const set = (k: keyof FormData, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    const next = () => {
        const e = validateStep(step, form);
        setErrors(e);
        if (Object.keys(e).length === 0) setStep(s => s + 1);
    };
    const back = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validateStep(3, form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setIsLoading(true);
        setApiError("");

        try {
            const payload: any = {
                name: form.name,
                email: form.email,
                password: form.password,
                age: Number(form.age),
                gender: form.gender,
                state: form.state,
                district: form.district,
                caste: form.caste,
                annualIncome: Number(form.annualIncome),
                disability: form.disability,
                disabilityType: form.disability ? form.disabilityType : null,
                rationCard: form.rationCard,
                religion: form.religion || null,
                occupation: form.occupation,
            };

            const occ = form.occupation;
            if (occ === "Student") {
                payload.educationLevel = form.educationLevel;
                payload.institutionType = form.institutionType;
                payload.courseName = form.courseName;
                payload.yearOfStudy = Number(form.yearOfStudy);
                payload.marksPercentage = form.marksPercentage ? Number(form.marksPercentage) : null;
            }
            if (occ === "Teacher" || occ === "Researcher") {
                payload.educationLevel = form.educationLevel;
                payload.institutionType = form.institutionType;
                payload.courseName = form.courseName || null;
                payload.experienceYears = Number(form.experienceYears);
            }
            if (occ === "Farmer") {
                payload.landSizeAcres = Number(form.landSizeAcres);
                payload.landOwnership = form.landOwnership;
                payload.cropType = form.cropType;
                payload.irrigationAccess = form.irrigationAccess;
            }
            if (occ === "DairyFarm") {
                payload.landSizeAcres = form.landSizeAcres ? Number(form.landSizeAcres) : null;
                payload.landOwnership = form.landOwnership;
                payload.animalCount = Number(form.animalCount);
                payload.animalType = form.animalType;
            }
            if (occ === "Business" || occ === "SmallBusiness") {
                payload.businessType = form.businessType;
                payload.gstRegistered = form.gstRegistered;
                payload.employeeCount = form.employeeCount ? Number(form.employeeCount) : null;
                payload.annualTurnover = form.annualTurnover ? Number(form.annualTurnover) : null;
            }
            if (occ === "SmallBusiness") {
                payload.msmeRegistered = form.msmeRegistered;
                payload.udyamNumber = form.udyamNumber || null;
            }
            if (occ === "JobSeeker") {
                payload.educationLevel = form.educationLevel;
                payload.experienceYears = form.experienceYears ? Number(form.experienceYears) : 0;
            }

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed");
            }

            // Wait 1s for Supabase propagation (especially after admin.createUser)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Auto-login using AuthContext (correct way)
            const loginEmail = form.email;
            const loginPass = form.password;
            let loginRes = await login(loginEmail, loginPass);

            // Retry once if it fails (propagation can be slow)
            if (loginRes.error) {
                console.log("Auto-login retry 1...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                loginRes = await login(form.email, form.password);
            }

            if (!loginRes.error) {
                router.push("/profile");
            } else {
                console.error("Auto-login failed after retry:", loginRes.error);
                router.push("/login?message=Account created, please login");
            }
        } catch (err: any) {
            setApiError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /* ── Step indicator ─────────────────────────────────────── */
    const StepBar = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {s}
                    </div>
                    {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
            ))}
        </div>
    );

    const stepLabels = ["Account", "Personal Info", "Occupation"];

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <main className="min-h-screen pt-32 pb-20 bg-[#f3f0e9] flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">

                {/* Header — UNCHANGED */}
                <div className="bg-[#111111] p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_-100px,#1a1a1a,transparent)]"></div>
                    <h1 className="text-3xl font-extrabold text-white mb-2 relative z-10">Create Account</h1>
                    <p className="text-gray-400 relative z-10">Step {step} of 3 &mdash; {stepLabels[step - 1]}</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <StepBar />
                    {apiError && <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg mb-4">{apiError}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ── STEP 1: Account ────────────────────── */}
                        {step === 1 && (
                            <>
                                <Field label="Full Name" error={errors.name} id="reg-name">
                                    <input id="reg-name" name="name" type="text" className={inputCls} placeholder="Smit Patel" value={form.name} onChange={e => set("name", e.target.value)} />
                                </Field>
                                <Field label="Email Address" error={errors.email} id="reg-email">
                                    <input id="reg-email" name="email" type="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                                </Field>
                                <Field label="Password" error={errors.password} id="reg-password">
                                    <input id="reg-password" name="password" type="password" className={inputCls} placeholder="Min 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                                </Field>
                            </>
                        )}

                        {/* ── STEP 2: Personal Info ───────────────── */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Age" error={errors.age} id="reg-age">
                                        <input id="reg-age" type="number" className={inputCls} placeholder="25" value={form.age} onChange={e => set("age", e.target.value)} />
                                    </Field>
                                    <Field label="Gender" error={errors.gender} id="reg-gender">
                                        <select id="reg-gender" className={selectCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                                            <option value="">Select...</option>
                                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="State" error={errors.state} id="reg-state">
                                        <input id="reg-state" type="text" className={inputCls} placeholder="Gujarat" value={form.state} onChange={e => set("state", e.target.value)} />
                                    </Field>
                                    <Field label="District" error={errors.district} id="reg-district">
                                        <input id="reg-district" type="text" className={inputCls} placeholder="Ahmedabad" value={form.district} onChange={e => set("district", e.target.value)} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Caste Category" error={errors.caste} id="reg-caste">
                                        <select id="reg-caste" className={selectCls} value={form.caste} onChange={e => set("caste", e.target.value)}>
                                            {CASTES.map(c => <option key={c} value={c}>{humanize(c)}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Annual Income (Rs)" error={errors.annualIncome} id="reg-income">
                                        <input id="reg-income" type="number" className={inputCls} placeholder="300000" value={form.annualIncome} onChange={e => set("annualIncome", e.target.value)} />
                                    </Field>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Ration Card">
                                        <select className={selectCls} value={form.rationCard} onChange={e => set("rationCard", e.target.value)}>
                                            {RATION_CARDS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Religion (Optional)">
                                        <input type="text" className={inputCls} placeholder="Hindu, Muslim..." value={form.religion} onChange={e => set("religion", e.target.value)} />
                                    </Field>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <input type="checkbox" id="disability" checked={form.disability} onChange={e => set("disability", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                    <label htmlFor="disability" className="text-sm font-bold text-gray-700">Person with Disability</label>
                                </div>
                                {form.disability && (
                                    <Field label="Disability Type" error={errors.disabilityType}>
                                        <input type="text" className={inputCls} placeholder="e.g. Visual, Hearing, Locomotor" value={form.disabilityType} onChange={e => set("disabilityType", e.target.value)} />
                                    </Field>
                                )}
                            </>
                        )}

                        {/* ── STEP 3: Occupation ──────────────────── */}
                        {step === 3 && (
                            <>
                                <Field label="Occupation" error={errors.occupation} id="reg-occupation">
                                    <select id="reg-occupation" className={selectCls} value={form.occupation} onChange={e => set("occupation", e.target.value)}>
                                        <option value="">Select your occupation...</option>
                                        {OCCUPATIONS.map(o => <option key={o} value={o}>{humanize(o)}</option>)}
                                    </select>
                                </Field>

                                {/* Student */}
                                {form.occupation === "Student" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Education Level" error={errors.educationLevel} id="reg-edu-level">
                                                <select id="reg-edu-level" className={selectCls} value={form.educationLevel} onChange={e => set("educationLevel", e.target.value)}>
                                                    <option value="">Select...</option>
                                                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{humanize(l)}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Institution Type" error={errors.institutionType} id="reg-inst-type">
                                                <select id="reg-inst-type" className={selectCls} value={form.institutionType} onChange={e => set("institutionType", e.target.value)}>
                                                    <option value="">Select...</option>
                                                    {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{humanize(t)}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        <Field label="Course Name" error={errors.courseName} id="reg-course">
                                            <input id="reg-course" type="text" className={inputCls} placeholder="e.g. B.Tech CSE" value={form.courseName} onChange={e => set("courseName", e.target.value)} />
                                        </Field>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Year of Study" error={errors.yearOfStudy} id="reg-year">
                                                <input id="reg-year" type="number" className={inputCls} placeholder="1-7" value={form.yearOfStudy} onChange={e => set("yearOfStudy", e.target.value)} />
                                            </Field>
                                            <Field label="Marks % (Optional)" id="reg-marks">
                                                <input id="reg-marks" type="number" className={inputCls} placeholder="85" value={form.marksPercentage} onChange={e => set("marksPercentage", e.target.value)} />
                                            </Field>
                                        </div>
                                    </>
                                )}

                                {/* Teacher / Researcher */}
                                {(form.occupation === "Teacher" || form.occupation === "Researcher") && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Education Level" error={errors.educationLevel} id="reg-teacher-edu">
                                                <select id="reg-teacher-edu" className={selectCls} value={form.educationLevel} onChange={e => set("educationLevel", e.target.value)}>
                                                    <option value="">Select...</option>
                                                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{humanize(l)}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Institution Type" error={errors.institutionType} id="reg-teacher-inst">
                                                <select id="reg-teacher-inst" className={selectCls} value={form.institutionType} onChange={e => set("institutionType", e.target.value)}>
                                                    <option value="">Select...</option>
                                                    {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{humanize(t)}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        <Field label="Subject / Department (Optional)">
                                            <input type="text" className={inputCls} placeholder="e.g. Physics" value={form.courseName} onChange={e => set("courseName", e.target.value)} />
                                        </Field>
                                        <Field label="Experience (Years)" error={errors.experienceYears}>
                                            <input type="number" className={inputCls} placeholder="5" value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)} />
                                        </Field>
                                    </>
                                )}

                                {/* Farmer */}
                                {form.occupation === "Farmer" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Land Size (Acres)" error={errors.landSizeAcres} id="reg-land-size">
                                                <input id="reg-land-size" type="number" step="0.1" className={inputCls} placeholder="2.5" value={form.landSizeAcres} onChange={e => set("landSizeAcres", e.target.value)} />
                                            </Field>
                                            <Field label="Crop Type" error={errors.cropType} id="reg-crop-type">
                                                <input id="reg-crop-type" type="text" className={inputCls} placeholder="Wheat, Rice" value={form.cropType} onChange={e => set("cropType", e.target.value)} />
                                            </Field>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="landOwn" checked={form.landOwnership} onChange={e => set("landOwnership", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                                <label htmlFor="landOwn" className="text-sm font-bold text-gray-700">Owns Land</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="irrigation" checked={form.irrigationAccess} onChange={e => set("irrigationAccess", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                                <label htmlFor="irrigation" className="text-sm font-bold text-gray-700">Irrigation Access</label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Dairy Farm */}
                                {form.occupation === "DairyFarm" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Animal Count" error={errors.animalCount}>
                                                <input type="number" className={inputCls} placeholder="10" value={form.animalCount} onChange={e => set("animalCount", e.target.value)} />
                                            </Field>
                                            <Field label="Animal Type" error={errors.animalType}>
                                                <input type="text" className={inputCls} placeholder="Cow, Buffalo" value={form.animalType} onChange={e => set("animalType", e.target.value)} />
                                            </Field>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Land Size (Optional)">
                                                <input type="number" step="0.1" className={inputCls} placeholder="1.0" value={form.landSizeAcres} onChange={e => set("landSizeAcres", e.target.value)} />
                                            </Field>
                                            <div className="flex items-center gap-2 pt-8">
                                                <input type="checkbox" id="landOwnDairy" checked={form.landOwnership} onChange={e => set("landOwnership", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                                <label htmlFor="landOwnDairy" className="text-sm font-bold text-gray-700">Owns Land</label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Business / Small Business */}
                                {(form.occupation === "Business" || form.occupation === "SmallBusiness") && (
                                    <>
                                        <Field label="Business Type" error={errors.businessType}>
                                            <input type="text" className={inputCls} placeholder="Manufacturing, Service, Retail" value={form.businessType} onChange={e => set("businessType", e.target.value)} />
                                        </Field>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Employee Count (Optional)">
                                                <input type="number" className={inputCls} placeholder="10" value={form.employeeCount} onChange={e => set("employeeCount", e.target.value)} />
                                            </Field>
                                            <Field label="Annual Turnover (Optional)">
                                                <input type="number" className={inputCls} placeholder="500000" value={form.annualTurnover} onChange={e => set("annualTurnover", e.target.value)} />
                                            </Field>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="gst" checked={form.gstRegistered} onChange={e => set("gstRegistered", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                                <label htmlFor="gst" className="text-sm font-bold text-gray-700">GST Registered</label>
                                            </div>
                                            {form.occupation === "SmallBusiness" && (
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" id="msme" checked={form.msmeRegistered} onChange={e => set("msmeRegistered", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                                    <label htmlFor="msme" className="text-sm font-bold text-gray-700">MSME Registered</label>
                                                </div>
                                            )}
                                        </div>
                                        {form.occupation === "SmallBusiness" && form.msmeRegistered && (
                                            <Field label="Udyam Number (Optional)">
                                                <input type="text" className={inputCls} placeholder="UDYAM-XX-00-0000000" value={form.udyamNumber} onChange={e => set("udyamNumber", e.target.value)} />
                                            </Field>
                                        )}
                                    </>
                                )}

                                {/* Job Seeker */}
                                {form.occupation === "JobSeeker" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Education Level" error={errors.educationLevel} id="reg-job-edu">
                                            <select id="reg-job-edu" className={selectCls} value={form.educationLevel} onChange={e => set("educationLevel", e.target.value)}>
                                                <option value="">Select...</option>
                                                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{humanize(l)}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Experience (Years)" id="reg-job-exp">
                                            <input id="reg-job-exp" type="number" className={inputCls} placeholder="0" value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)} />
                                        </Field>
                                    </div>
                                )}

                                {/* Self Employed / Other — no extra fields */}
                                {(form.occupation === "SelfEmployed" || form.occupation === "Other") && (
                                    <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-xl">No additional fields required for this occupation.</p>
                                )}
                            </>
                        )}

                        {/* ── Navigation Buttons ──────────────────── */}
                        <div className="flex gap-3 pt-2">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={back}
                                    className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={next}
                                    className="flex-1 bg-[#111111] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black hover:-translate-y-1 transition-all"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-[#111111] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {isLoading ? (
                                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Social + Login link — UNCHANGED */}
                    <div className="mt-8 relative text-center">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200"></div>
                        <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Or Register With</span>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700">
                            <span className="text-xl">G</span> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700">
                            <span className="text-xl text-blue-600">e</span> e-Pramaan
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
