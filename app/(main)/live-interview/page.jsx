"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
    Mic,
    Loader2,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    MessageSquare,
    PanelRightClose,
    PanelRightOpen,
    XSquare,
    Trophy,
    Zap,
    Brain,
    Target,
    BarChart3,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// Animated Counter Hook
// ============================================================================
function useCountUp(target, duration = 1500) {
    const [count, setCount] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        if (target === null || target === undefined) return;

        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(startValue + (target - startValue) * eased));

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [target, duration]);

    return count;
}

// ============================================================================
// Score Ring Component (SVG-based progress ring)
// ============================================================================
function ScoreRing({ score, size = 160, strokeWidth = 10, label }) {
    const animatedScore = useCountUp(score);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    const getColor = (s) => {
        if (s >= 80) return "hsl(142, 76%, 40%)";   // green
        if (s >= 50) return "hsl(45, 93%, 50%)";     // yellow
        return "hsl(0, 84%, 60%)";                    // red
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor(score)}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-[1500ms] ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{animatedScore}</span>
                <span className="text-xs text-muted-foreground font-medium">{label || "/ 100"}</span>
            </div>
        </div>
    );
}

// ============================================================================
// Score Badge (Excellent / Good / Needs Improvement)
// ============================================================================
function StatusBadge({ score }) {
    if (score >= 80) {
        return (
            <Badge className="bg-green-500/15 text-green-500 border-green-500/25 hover:bg-green-500/20 text-sm px-3 py-1">
                <Trophy className="w-3.5 h-3.5 mr-1.5" /> Excellent
            </Badge>
        );
    }
    if (score >= 50) {
        return (
            <Badge className="bg-yellow-500/15 text-yellow-500 border-yellow-500/25 hover:bg-yellow-500/20 text-sm px-3 py-1">
                <Zap className="w-3.5 h-3.5 mr-1.5" /> Good
            </Badge>
        );
    }
    return (
        <Badge className="bg-red-500/15 text-red-500 border-red-500/25 hover:bg-red-500/20 text-sm px-3 py-1">
            <Target className="w-3.5 h-3.5 mr-1.5" /> Needs Improvement
        </Badge>
    );
}

// ============================================================================
// Animated Score Card
// ============================================================================
function ScoreCard({ icon: Icon, label, score, color }) {
    const animatedScore = useCountUp(score);

    const colorMap = {
        blue: { text: "text-blue-500", bg: "bg-blue-500/10", bar: "bg-blue-500" },
        purple: { text: "text-purple-500", bg: "bg-purple-500/10", bar: "bg-purple-500" },
        amber: { text: "text-amber-500", bg: "bg-amber-500/10", bar: "bg-amber-500" },
        green: { text: "text-green-500", bg: "bg-green-500/10", bar: "bg-green-500" },
    };

    const c = colorMap[color] || colorMap.blue;

    return (
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${c.bg}`}>
                        <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <span className={`text-2xl font-bold ${c.text}`}>{animatedScore}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
                <div className="w-full bg-muted rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${c.bar} transition-all duration-[1500ms] ease-out`}
                        style={{ width: `${animatedScore}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// Main Page Component
// ============================================================================
export default function LiveInterviewPage() {
    const { user, isLoaded } = useUser();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transcript, setTranscript] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [finalReport, setFinalReport] = useState(null);
    const [showTranscript, setShowTranscript] = useState(false);

    const recognitionRef = useRef(null);
    const synthRef = useRef(null);

    // ---- Speech APIs (unchanged) ----
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event) => {
                    let currentTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setCurrentAnswer((prev) => prev + " " + currentTranscript);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                toast.warning("Speech recognition is not supported in your browser.");
            }
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    useEffect(() => {
        if (isLoaded && user && questions.length === 0 && !finalReport) {
            startInterview();
        }
    }, [isLoaded, user]);

    // ---- Business logic (completely unchanged) ----
    const startInterview = async () => {
        setIsAIThinking(true);
        try {
            const industry = user?.publicMetadata?.industry || "Software Engineering";
            const role = "Candidate";

            const res = await fetch("/api/generate-interview-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, role, skills: [] }),
            });

            if (!res.ok) throw new Error("Failed to generate questions");
            const data = await res.json();
            setQuestions(data.questions);
            setIsAIThinking(false);

            if (data.questions.length > 0) {
                speak(data.questions[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not start interview.");
            setIsAIThinking(false);
        }
    };

    const speak = (text) => {
        if (synthRef.current) {
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsAISpeaking(true);
            utterance.onend = () => setIsAISpeaking(false);
            utterance.onerror = () => setIsAISpeaking(false);

            const voices = synthRef.current.getVoices();
            const preferredVoice =
                voices.find((v) => v.name.includes("Google") && v.lang.includes("en")) ||
                voices.find((v) => v.lang.includes("en"));
            if (preferredVoice) utterance.voice = preferredVoice;

            synthRef.current.speak(utterance);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            if (recognitionRef.current) {
                setCurrentAnswer("");
                recognitionRef.current.start();
                setIsRecording(true);
            } else {
                toast.error("Speech recognition not supported.");
            }
        }
    };

    const handleNextQuestion = () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer before continuing.");
            return;
        }

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsAISpeaking(false);
        }

        const newTranscript = [
            ...transcript,
            { question: questions[currentIndex], answer: currentAnswer.trim() },
        ];
        setTranscript(newTranscript);
        setCurrentAnswer("");

        if (currentIndex < questions.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            speak(questions[nextIndex]);
        } else {
            evaluateInterview(newTranscript);
        }
    };

    const handleEndEarly = () => {
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsAISpeaking(false);
        }

        let finalTranscript = [...transcript];
        if (currentAnswer.trim()) {
            finalTranscript.push({ question: questions[currentIndex], answer: currentAnswer.trim() });
        }

        if (finalTranscript.length === 0) {
            toast.error("You must answer at least one question before ending.");
            return;
        }

        evaluateInterview(finalTranscript);
    };

    const evaluateInterview = async (fullTranscript) => {
        setIsAIThinking(true);
        try {
            const industry = user?.publicMetadata?.industry || "Software Engineering";
            const role = "Candidate";

            const res = await fetch("/api/evaluate-live-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, role, fullTranscript }),
            });

            if (!res.ok) throw new Error("Failed to evaluate interview");
            const data = await res.json();
            setFinalReport(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not generate final report.");
        } finally {
            setIsAIThinking(false);
        }
    };

    // ========================================================================
    //  RENDER: Final Report
    // ========================================================================
    if (finalReport) {
        // Radar chart data
        const radarData = [
            { subject: "Technical", value: finalReport.technicalScore, fullMark: 100 },
            { subject: "Communication", value: finalReport.communicationScore, fullMark: 100 },
            { subject: "Confidence", value: finalReport.confidenceScore, fullMark: 100 },
            { subject: "Problem Solving", value: Math.round((finalReport.technicalScore + finalReport.overallScore) / 2), fullMark: 100 },
            { subject: "Clarity", value: Math.round((finalReport.communicationScore + finalReport.confidenceScore) / 2), fullMark: 100 },
        ];

        // Bar chart data
        const barData = [
            { name: "Technical", score: finalReport.technicalScore },
            { name: "Communication", score: finalReport.communicationScore },
            { name: "Confidence", score: finalReport.confidenceScore },
        ];

        const getBarColor = (score) => {
            if (score >= 80) return "hsl(142, 76%, 40%)";
            if (score >= 50) return "hsl(45, 93%, 50%)";
            return "hsl(0, 84%, 60%)";
        };

        return (
            <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3 animate-in fade-in-50 duration-500">
                        <h1 className="text-5xl font-bold gradient-title">Interview Complete</h1>
                        <p className="text-muted-foreground text-lg">
                            Here is your comprehensive performance analysis
                        </p>
                    </div>

                    {/* Hero Score Section */}
                    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                        <Card className="overflow-hidden">
                            <CardContent className="pt-8 pb-8">
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    {/* Score Ring */}
                                    <div className="flex flex-col items-center gap-4">
                                        <ScoreRing score={finalReport.overallScore} size={180} strokeWidth={12} label="Overall" />
                                        <StatusBadge score={finalReport.overallScore} />
                                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                                            Based on industry standards for {user?.publicMetadata?.industry || "Software Engineering"}
                                        </p>
                                    </div>

                                    {/* Radar Chart */}
                                    <div className="flex-1 w-full min-h-[280px]">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <RadarChart data={radarData}>
                                                <PolarGrid stroke="hsl(var(--border))" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={90}
                                                    domain={[0, 100]}
                                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                                                />
                                                <Radar
                                                    name="Score"
                                                    dataKey="value"
                                                    stroke="hsl(var(--chart-1))"
                                                    fill="hsl(var(--chart-1))"
                                                    fillOpacity={0.2}
                                                    strokeWidth={2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Score Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-150">
                        <ScoreCard icon={Brain} label="Technical Skills" score={finalReport.technicalScore} color="blue" />
                        <ScoreCard icon={MessageSquare} label="Communication" score={finalReport.communicationScore} color="purple" />
                        <ScoreCard icon={Zap} label="Confidence Level" score={finalReport.confidenceScore} color="amber" />
                    </div>

                    {/* Bar Chart */}
                    <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Performance Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={110} />
                                            <Tooltip
                                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    borderColor: "hsl(var(--border))",
                                                    borderRadius: "8px",
                                                    color: "hsl(var(--foreground))",
                                                }}
                                            />
                                            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
                                                {barData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Strengths
                                    <Badge className="ml-auto bg-green-500/15 text-green-500 border-green-500/25">
                                        {finalReport.strengths?.length || 0}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {finalReport.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0 group-hover:scale-125 transition-transform" />
                                            <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Areas to Improve
                                    <Badge className="ml-auto bg-amber-500/15 text-amber-500 border-amber-500/25">
                                        {finalReport.weaknesses?.length || 0}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {finalReport.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                                            <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filler Analysis + Action Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-700">
                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Filler Word Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <span className="text-sm text-muted-foreground">Total Fillers Detected</span>
                                    <Badge variant="secondary" className="font-bold">
                                        {finalReport.fillerWordAnalysis?.fillerCount ?? 0}
                                    </Badge>
                                </div>
                                {finalReport.fillerWordAnalysis?.repeatedPhrases?.length > 0 && (
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block font-medium">
                                            Repeated Phrases
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {finalReport.fillerWordAnalysis.repeatedPhrases.map((p, i) => (
                                                <Badge key={i} variant="outline" className="font-normal">
                                                    {p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {finalReport.fillerWordAnalysis?.improvementSuggestion && (
                                    <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {finalReport.fillerWordAnalysis.improvementSuggestion}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Personalized Action Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {finalReport.improvementPlan}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in-50 duration-700 delay-1000">
                        <Button onClick={() => window.location.reload()} size="lg" className="px-8">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Retry Interview
                        </Button>
                        <Link href="/dashboard">
                            <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    //  RENDER: Interview Room
    // ========================================================================
    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col md:flex-row">
            {/* Subtle ambient gradient */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Interview Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full md:w-2/3 h-[60vh] md:h-screen">
                {isAIThinking || questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-28 h-28 rounded-full border-4 border-muted border-t-primary animate-spin" />
                        <p className="text-primary animate-pulse font-medium text-lg tracking-wide">
                            {questions.length === 0
                                ? "Preparing your custom interview..."
                                : "Evaluating your answers..."}
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl flex flex-col items-center space-y-10">
                        {/* Question counter + End Early */}
                        <div className="w-full flex justify-between items-center px-4">
                            <Badge variant="outline">
                                Question {currentIndex + 1} of {questions.length}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEndEarly}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden md:flex"
                            >
                                <XSquare className="w-4 h-4 mr-2" /> End Early
                            </Button>
                        </div>

                        {/* Progress bar segments */}
                        <div className="w-full px-4 flex space-x-1.5">
                            {[...Array(questions.length)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= currentIndex ? "bg-primary" : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* AI Avatar */}
                        {/* AI Avatar */}
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => speak(questions[currentIndex])}
                        >
                            {/* Glow Effect */}
                            <div
                                className={`absolute inset-0 rounded-full bg-primary/20 blur-2xl transition-all duration-500 ${isAISpeaking
                                    ? "scale-125 opacity-100"
                                    : "scale-100 opacity-0 group-hover:opacity-60"
                                    }`}
                            />

                            {/* Avatar Circle */}
                            <div
                                className={`relative w-44 h-44 rounded-full 
    bg-gradient-to-br from-primary/10 to-primary/5
    border border-primary/20 
    shadow-[0_0_60px_rgba(59,130,246,0.25)]
    flex items-center justify-center
    overflow-hidden
    transition-all duration-500
    ${isAISpeaking ? "scale-110" : ""}
    `}
                            >
                                {isAISpeaking ? (
                                    <div className="flex space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="w-2 h-10 bg-primary rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Image
                                        src="/ai.png"
                                        alt="AI Assistant"
                                        fill
                                        className="object-contain p-10 transition-transform duration-300 group-hover:scale-105"
                                        priority
                                    />
                                )}
                            </div>
                        </div>

                        {/* Question text */}
                        <div className="text-center w-full px-6 min-h-[80px] flex items-center justify-center">
                            <h2 className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
                                &ldquo;{questions[currentIndex]}&rdquo;
                            </h2>
                        </div>

                        {/* Recording Controls */}
                        <div className="mt-8 flex flex-col items-center space-y-5">
                            <button
                                onClick={toggleRecording}
                                className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isRecording
                                    ? "bg-destructive/10 border-2 border-destructive shadow-destructive/20"
                                    : "bg-card border border-border hover:border-primary/50 hover:bg-accent"
                                    }`}
                            >
                                {isRecording ? (
                                    <>
                                        <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                                        <div className="relative flex items-center justify-center">
                                            <div className="w-6 h-6 rounded-sm bg-destructive animate-pulse" />
                                        </div>
                                    </>
                                ) : (
                                    <Mic className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                            </button>

                            <div className="flex flex-col items-center space-y-2">
                                <p className={`text-sm tracking-wide ${isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
                                    {isRecording ? "Listening..." : "Tap Mic to Answer"}
                                </p>

                                <textarea
                                    className="mt-3 bg-card border border-border rounded-lg text-foreground p-3 w-64 md:w-96 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                                    placeholder="Or type your answer here..."
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Next / Complete Button */}
                        {currentAnswer.trim() && !isRecording && (
                            <Button onClick={handleNextQuestion} size="lg" className="px-8 py-6 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all">
                                {currentIndex < questions.length - 1 ? "Next Question" : "Complete Interview"}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Transcript Toggle */}
            {!isAIThinking && questions.length > 0 && (
                <div className="absolute top-6 right-6 z-50">
                    <Button
                        variant="outline"
                        className="backdrop-blur-md"
                        onClick={() => setShowTranscript(!showTranscript)}
                    >
                        {showTranscript ? (
                            <>
                                <PanelRightClose className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Hide Transcript</span>
                            </>
                        ) : (
                            <>
                                <PanelRightOpen className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Show Transcript</span>
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* End Early Mobile */}
            {!isAIThinking && questions.length > 0 && (
                <div className="absolute top-6 left-6 z-50 md:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEndEarly}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <XSquare className="w-4 h-4 mr-2" /> End
                    </Button>
                </div>
            )}

            {/* Side Transcript Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-[85vw] sm:w-[50vw] md:w-[400px] bg-card/95 backdrop-blur-xl border-l border-border p-6 flex flex-col h-full overflow-y-auto transition-transform duration-500 ease-in-out z-40 transform ${showTranscript ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <h3 className="text-muted-foreground font-medium tracking-wider uppercase text-xs mb-6 flex items-center sticky top-0 bg-card/90 py-2 z-10 w-full">
                    <MessageSquare className="w-3 h-3 mr-2" /> Live Transcript
                </h3>

                <div className="flex-1 space-y-6">
                    {transcript.map((item, idx) => (
                        <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-start">
                                <div className="bg-muted text-foreground text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] border">
                                    {item.question}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary/10 text-foreground text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/20">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentAnswer && (
                        <div className="flex justify-end animate-in fade-in">
                            <div className="bg-primary/5 text-muted-foreground text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/10">
                                {currentAnswer}
                                {isRecording && (
                                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse rounded-full" />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
