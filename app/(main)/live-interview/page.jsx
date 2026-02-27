"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mic, MicOff, Loader2, ArrowRight, Play, CheckCircle2, AlertTriangle, MessageSquare, PanelRightClose, PanelRightOpen, XSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

    useEffect(() => {
        // Initialize Speech APIs
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
                toast.warning("Speech recognition is not supported in your browser. Fallback to text input isn't fully implemented in this cinematic demo, but you can type below!");
            }

            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (isLoaded && user && questions.length === 0 && !finalReport) {
            startInterview();
        }
    }, [isLoaded, user]);

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
            synthRef.current.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);

            utterance.onstart = () => setIsAISpeaking(true);
            utterance.onend = () => setIsAISpeaking(false);
            utterance.onerror = () => setIsAISpeaking(false);

            // Try to find a good English voice
            const voices = synthRef.current.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) ||
                voices.find(v => v.lang.includes('en'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            synthRef.current.speak(utterance);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
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

        // Stop recording and speaking if active
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsAISpeaking(false);
        }

        // Save to transcript
        const newTranscript = [
            ...transcript,
            { question: questions[currentIndex], answer: currentAnswer.trim() }
        ];
        setTranscript(newTranscript);
        setCurrentAnswer("");

        // Move to next question or evaluate
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
        // Include current partial answer if it has text
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

    // Render Final Report
    if (finalReport) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Interview Completed</h1>
                        <p className="text-zinc-400">Here is your comprehensive performance analysis.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-4 p-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex flex-col items-center md:items-start space-y-2 w-full md:w-1/3">
                                    <span className="text-zinc-400 font-medium tracking-wider uppercase text-sm">Overall Target</span>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-7xl font-extrabold text-white">{Math.round(finalReport.overallScore)}</span>
                                        <span className="text-xl text-zinc-500">/100</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-2 text-center md:text-left">
                                        Based on industry standards for {user?.publicMetadata?.industry || "Software Engineering"}.
                                    </p>
                                </div>

                                <div className="w-full md:w-2/3 h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'Technical', score: finalReport.technicalScore, color: '#3b82f6' },
                                            { name: 'Communication', score: finalReport.communicationScore, color: '#6366f1' },
                                            { name: 'Confidence', score: finalReport.confidenceScore, color: '#a855f7' }
                                        ]} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <XAxis type="number" domain={[0, 100]} stroke="#52525b" />
                                            <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontWeight="500" width={100} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                                                {
                                                    [
                                                        { name: 'Technical', score: finalReport.technicalScore, color: '#3b82f6' },
                                                        { name: 'Communication', score: finalReport.communicationScore, color: '#6366f1' },
                                                        { name: 'Confidence', score: finalReport.confidenceScore, color: '#a855f7' }
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))
                                                }
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center text-green-400">
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {finalReport.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="text-green-500 mr-2">•</span>
                                            <span className="text-zinc-300 text-sm leading-relaxed">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center text-amber-400">
                                    <AlertTriangle className="w-5 h-5 mr-2" /> Areas to Improve
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {finalReport.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="text-amber-500 mr-2">•</span>
                                            <span className="text-zinc-300 text-sm leading-relaxed">{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 col-span-1 md:col-span-4">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center text-indigo-400">
                                            <MessageSquare className="w-5 h-5 mr-2" /> Filler Word Analysis
                                        </h3>
                                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-zinc-400 text-sm">Total Fillers Detected</span>
                                                <Badge variant="outline" className="text-indigo-400 border-indigo-400/30 bg-indigo-400/10">
                                                    {finalReport.fillerWordAnalysis.fillerCount}
                                                </Badge>
                                            </div>
                                            {finalReport.fillerWordAnalysis.repeatedPhrases.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Repeated Phrases</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {finalReport.fillerWordAnalysis.repeatedPhrases.map((p, i) => (
                                                            <Badge key={i} variant="secondary" className="bg-zinc-800 text-zinc-300 font-normal hover:bg-zinc-700">{p}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/50 pt-4 mt-2">
                                                {finalReport.fillerWordAnalysis.improvementSuggestion}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center text-blue-400">
                                            <ArrowRight className="w-5 h-5 mr-2" /> Personalized Action Plan
                                        </h3>
                                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/50 h-full">
                                            <p className="text-sm text-zinc-300 leading-relaxed">
                                                {finalReport.improvementPlan}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-center space-x-4 pt-4">
                        <Button onClick={() => window.location.reload()} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Retry Interview
                        </Button>
                        <Link href="/dashboard">
                            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render Loading or Interview Room
    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col md:flex-row">
            {/* Background ambient light */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Interview Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full md:w-2/3 h-[60vh] md:h-screen">

                {isAIThinking || questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-32 h-32 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
                        <p className="text-indigo-400 animate-pulse font-medium text-lg tracking-wide">
                            {questions.length === 0 ? "Preparing your custom interview..." : "Evaluating your answers..."}
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl flex flex-col items-center space-y-12">

                        <div className="w-full flex justify-between items-center px-4">
                            <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 border-zinc-800">
                                Question {currentIndex + 1} of {questions.length}
                            </Badge>

                            <Button variant="ghost" size="sm" onClick={handleEndEarly} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hidden md:flex">
                                <XSquare className="w-4 h-4 mr-2" /> End Early
                            </Button>
                        </div>
                        <div className="w-full px-4 flex space-x-1">
                            {[...Array(questions.length)].map((_, i) => (
                                <div key={i} className={`h-1.5 w-full rounded-full transition-all duration-300 ${i <= currentIndex ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
                            ))}
                        </div>

                        {/* AI Avatar */}
                        <div className="relative group cursor-pointer" onClick={() => speak(questions[currentIndex])}>
                            <div className={`absolute inset-0 rounded-full bg-indigo-500/20 blur-xl transition-all duration-500 ${isAISpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-0 group-hover:opacity-50'}`} />
                            <div className={`relative w-32 h-32 rounded-full bg-zinc-900 border-2 flex items-center justify-center shadow-2xl transition-all duration-300 z-10 ${isAISpeaking ? 'border-indigo-400 shadow-indigo-500/20' : 'border-zinc-800'}`}>
                                {isAISpeaking ? (
                                    <div className="flex space-x-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1.5 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                ) : (
                                    <Mic className="w-8 h-8 text-zinc-600" />
                                )}
                            </div>
                        </div>

                        <div className="text-center w-full px-6 min-h-[100px] flex items-center justify-center">
                            <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                                "{questions[currentIndex]}"
                            </h2>
                        </div>

                        <div className="mt-12 flex flex-col items-center space-y-6">
                            <button
                                onClick={toggleRecording}
                                className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                  ${isRecording
                                        ? 'bg-red-500/10 border-2 border-red-500 shadow-red-500/20'
                                        : 'bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                                    }`}
                            >
                                {isRecording ? (
                                    <>
                                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                        <div className="relative flex items-center justify-center">
                                            <div className="w-6 h-6 rounded-sm bg-red-500 animate-pulse" />
                                        </div>
                                    </>
                                ) : (
                                    <Mic className="w-8 h-8 text-zinc-300 group-hover:text-white transition-colors" />
                                )}
                            </button>

                            <div className="flex flex-col items-center space-y-2">
                                <p className={`text-sm tracking-wide ${isRecording ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
                                    {isRecording ? 'Listening...' : 'Tap Mic to Answer'}
                                </p>

                                {/* Visible fallback for typing */}
                                <textarea
                                    className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white p-3 w-64 md:w-96 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Or type your answer here..."
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {currentAnswer.trim() && !isRecording && (
                            <Button
                                onClick={handleNextQuestion}
                                className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-lg font-medium shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                            >
                                {currentIndex < questions.length - 1 ? "Next Question" : "Complete Interview"} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        )}

                    </div>
                )}
            </div>

            {/* Side Transcript Toggle Button */}
            {!isAIThinking && questions.length > 0 && (
                <div className="absolute top-6 right-6 z-50">
                    <Button variant="outline" className="bg-zinc-900/50 text-zinc-300 border-zinc-800 backdrop-blur-md hover:bg-zinc-800 hover:text-white" onClick={() => setShowTranscript(!showTranscript)}>
                        {showTranscript ? <><PanelRightClose className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Hide Transcript</span></> : <><PanelRightOpen className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Show Transcript</span></>}
                    </Button>
                </div>
            )}

            {/* End Early Mobile Button */}
            {!isAIThinking && questions.length > 0 && (
                <div className="absolute top-6 left-6 z-50 md:hidden">
                    <Button variant="outline" size="sm" onClick={handleEndEarly} className="bg-zinc-900/50 text-red-400 border-zinc-800 backdrop-blur-md hover:bg-zinc-800 hover:text-red-300 flex">
                        <XSquare className="w-4 h-4 mr-2" /> End
                    </Button>
                </div>
            )}

            {/* Side Transcript Panel */}
            <div className={`fixed inset-y-0 right-0 w-[85vw] sm:w-[50vw] md:w-[400px] bg-zinc-900/80 backdrop-blur-xl border-l border-zinc-800/50 p-6 flex flex-col h-full overflow-y-auto transition-transform duration-500 ease-in-out z-40 transform ${showTranscript ? 'translate-x-0' : 'translate-x-full'}`}>
                <h3 className="text-zinc-400 font-medium tracking-wider uppercase text-xs mb-6 flex items-center sticky top-0 bg-zinc-900/90 py-2 z-10 w-full">
                    <MessageSquare className="w-3 h-3 mr-2" /> Live Transcript
                </h3>

                <div className="flex-1 space-y-6">
                    {transcript.map((item, idx) => (
                        <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-start">
                                <div className="bg-zinc-800/80 text-zinc-300 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] border border-zinc-700/50">
                                    {item.question}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-indigo-600/20 text-indigo-100 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-indigo-500/20">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Current Live Answer */}
                    {currentAnswer && (
                        <div className="flex justify-end animate-in fade-in">
                            <div className="bg-indigo-600/10 text-indigo-200/80 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-indigo-500/10">
                                {currentAnswer}
                                {isRecording && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-400 animate-pulse rounded-full" />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
