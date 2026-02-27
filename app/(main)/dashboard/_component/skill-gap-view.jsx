"use client";

import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Target,
    Upload,
    Loader2,
    CheckCircle2,
    XCircle,
    BookOpen,
    Award,
    Clock,
    ExternalLink,
    Sparkles,
    FileText,
    BriefcaseIcon,
    TrendingUp,
    ShieldCheck,
} from "lucide-react";

const SkillGapView = () => {
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            setError("Please provide both your resume text and a job description.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/skill/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText, jobDescription }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to analyze skills");
            }

            setResult(data);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResumeText("");
        setJobDescription("");
        setResult(null);
        setError(null);
    };

    const getMatchColor = (percentage) => {
        if (percentage >= 80) return "text-green-500";
        if (percentage >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return "[&>div]:bg-green-500";
        if (percentage >= 50) return "[&>div]:bg-yellow-500";
        return "[&>div]:bg-red-500";
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            {!result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resume Input */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-primary" />
                                Your Resume
                            </CardTitle>
                            <CardDescription>
                                Paste your resume content below (plain text works best)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="resume-input"
                                placeholder="Paste your resume here... Include your skills, experience, education, certifications, etc."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="min-h-[250px] resize-none text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                {resumeText.length > 0
                                    ? `${resumeText.split(/\s+/).filter(Boolean).length} words`
                                    : "No content yet"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Job Description Input */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BriefcaseIcon className="h-5 w-5 text-primary" />
                                Job Description
                            </CardTitle>
                            <CardDescription>
                                Paste the job posting you want to match against
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="job-description-input"
                                placeholder="Paste the job description here... Include required skills, qualifications, responsibilities, etc."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="min-h-[250px] resize-none text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                {jobDescription.length > 0
                                    ? `${jobDescription.split(/\s+/).filter(Boolean).length} words`
                                    : "No content yet"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-6">
                        <p className="text-red-500 text-sm flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Analyze / Reset Buttons */}
            <div className="flex gap-3 justify-center">
                {!result ? (
                    <Button
                        id="analyze-button"
                        onClick={handleAnalyze}
                        disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                        size="lg"
                        className="px-8"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Target className="mr-2 h-4 w-4" />
                                Analyze Skill Gap
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        id="reset-button"
                        onClick={handleReset}
                        variant="outline"
                        size="lg"
                        className="px-8"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Another
                    </Button>
                )}
            </div>

            {/* Results Section */}
            {result && result.analysis && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                    {/* Match Percentage Hero */}
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl">Skill Match Score</CardTitle>
                            <CardDescription>
                                How well your skills align with the job requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div
                                className={`text-6xl font-bold ${getMatchColor(result.analysis.matchPercentage)}`}
                            >
                                {result.analysis.matchPercentage}%
                            </div>
                            <div className="w-full max-w-md">
                                <Progress
                                    value={result.analysis.matchPercentage}
                                    className={`h-3 ${getProgressColor(result.analysis.matchPercentage)}`}
                                />
                            </div>
                            {result.analysis.confidenceScore !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    Analysis Confidence:
                                    <span className="font-semibold text-foreground">
                                        {result.analysis.confidenceScore}%
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Summary */}
                    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                AI Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">{result.analysis.summary}</p>
                        </CardContent>
                    </Card>

                    {/* Skills Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Matched Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Matched Skills
                                    <Badge variant="secondary" className="ml-auto">
                                        {result.analysis.matchedSkills.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Skills you already have
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {result.analysis.matchedSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {result.analysis.matchedSkills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                                            >
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No matching skills found.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Missing Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    Missing Skills
                                    <Badge variant="secondary" className="ml-auto">
                                        {result.analysis.missingSkills.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Skills you need to develop
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {result.analysis.missingSkills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {result.analysis.missingSkills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="outline"
                                                className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                                            >
                                                <XCircle className="h-3 w-3 mr-1" />
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        You have all required skills! 🎉
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Recommended Courses
                                </CardTitle>
                                <CardDescription>
                                    Curated learning paths to fill your skill gaps
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.recommendations.map((rec, index) => (
                                        <Card
                                            key={index}
                                            className="hover:shadow-md transition-shadow border-muted"
                                        >
                                            <CardContent className="pt-4 space-y-3">
                                                <div>
                                                    <Badge variant="outline" className="mb-2 text-xs">
                                                        {rec.skill || rec.skillName}
                                                    </Badge>
                                                    <h4 className="font-semibold text-sm leading-tight">
                                                        {rec.url ? (
                                                            <a
                                                                href={rec.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline hover:text-primary transition-colors"
                                                            >
                                                                {rec.course_name || rec.courseName}
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                {rec.course_name || rec.courseName}
                                                            </span>
                                                        )}
                                                    </h4>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    {rec.platform && (
                                                        <span className="flex items-center gap-1">
                                                            <ExternalLink className="h-3 w-3" />
                                                            {rec.platform}
                                                        </span>
                                                    )}
                                                    {rec.duration && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {rec.duration}
                                                        </span>
                                                    )}
                                                    {rec.certification && (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <Award className="h-3 w-3" />
                                                            Certificate
                                                        </span>
                                                    )}
                                                    {rec.url && (
                                                        <a
                                                            href={rec.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-primary hover:underline"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            View Course
                                                        </a>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Footer */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">
                                    {result.analysis.matchedSkills.length +
                                        result.analysis.missingSkills.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total Skills Analyzed
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                                <div className="text-2xl font-bold text-green-500">
                                    {result.analysis.matchedSkills.length}
                                </div>
                                <p className="text-xs text-muted-foreground">Skills Matched</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold text-blue-500">
                                    {result.recommendations?.length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Courses Recommended
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillGapView;
