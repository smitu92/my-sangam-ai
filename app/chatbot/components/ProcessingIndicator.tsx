"use client";

import { useState, useEffect } from "react";

/* ── Processing Stages ────────────────────────────────────── */
const PROCESSING_STAGES = [
    { icon: "🔍", label: "Understanding your query..." },
    { icon: "📊", label: "Analyzing your profile & filters..." },
    { icon: "🗂️", label: "Searching relevant schemes..." },
    { icon: "✨", label: "Generating personalized response..." },
];

const STAGE_TIMINGS = [0, 1500, 4000, 7000]; // ms delays for each stage

export default function ProcessingIndicator({ loading }: { loading: boolean }) {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        if (!loading) {
            setActiveStage(0);
            return;
        }

        const timers: NodeJS.Timeout[] = [];
        STAGE_TIMINGS.forEach((delay, index) => {
            const timer = setTimeout(() => {
                setActiveStage(index);
            }, delay);
            timers.push(timer);
        });

        return () => timers.forEach(clearTimeout);
    }, [loading]);

    if (!loading) return null;

    return (
        <div className="flex justify-start chatMsg">
            <div className="flex gap-3 max-w-[85%]">
                {/* AI Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#3D4F2F] flex items-center justify-center shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </div>

                {/* Processing Card */}
                <div className="bg-white border border-[#E5DFD5] rounded-2xl rounded-tl-sm px-5 py-4 min-w-[280px]">
                    <div className="space-y-3">
                        {PROCESSING_STAGES.map((stage, index) => {
                            const isCompleted = index < activeStage;
                            const isActive = index === activeStage;
                            const isHidden = index > activeStage;

                            if (isHidden) return null;

                            return (
                                <div
                                    key={index}
                                    className={`processing-stage flex items-center gap-3 ${isActive ? "processing-stage-active" : ""}`}
                                >
                                    {/* Status Icon */}
                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        {isCompleted ? (
                                            <svg className="stage-check w-4 h-4 text-[#3D4F2F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : (
                                            <div className="processing-spinner w-4 h-4 border-2 border-[#D4DEC8] border-t-[#3D4F2F] rounded-full" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={`stage-label text-sm ${isCompleted ? "text-[#6B7F5E]" : "text-[#2D2D2D] font-medium"}`}>
                                        {stage.icon} {stage.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
