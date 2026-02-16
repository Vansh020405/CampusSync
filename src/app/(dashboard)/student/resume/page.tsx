'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils";

// Mock AI Analysis types
type Analysis = {
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
};

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null); // Reset analysis on new file
        }
    };

    const handleAnalyze = () => {
        if (!file) return;
        setIsAnalyzing(true);

        // Mock AI delay
        setTimeout(() => {
            // Mock random realistic score for demo
            const mockScore = Math.floor(Math.random() * (95 - 65 + 1) + 65);
            setAnalysis({
                score: mockScore,
                summary: "Your resume shows strong technical aptitude but lacks quantifiable achievements in project descriptions.",
                strengths: ["Clean formatting", "Relevant skills section", "Education details clear"],
                improvements: ["Add metrics to projects (e.g., 'improved by 20%')", "Use stronger action verbs", "Customize summary for specific roles"]
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500 from-emerald-500 to-teal-500";
        if (score >= 60) return "text-amber-500 from-amber-500 to-orange-500";
        return "text-rose-500 from-rose-500 to-red-500";
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-xl shadow-indigo-500/10 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700"></div>
                <div className="relative px-6 py-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20 shadow-lg">
                        <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Resume Optimiser
                    </h1>
                    <p className="text-indigo-100 font-medium max-w-lg mx-auto">
                        Upload your resume and get an instant AI-powered attractiveness score to boost your shortlist chances.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                {/* Upload Section */}
                <div className="space-y-4">
                    <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />

                            {!file ? (
                                <>
                                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <Upload className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        Drop your resume here
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Support for PDF, DOCX
                                    </p>
                                    <label htmlFor="resume-upload">
                                        <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 pointer-events-none" asChild>
                                            <span>Select File</span>
                                        </Button>
                                    </label>
                                </>
                            ) : (
                                <div className="w-full">
                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
                                        <div className="h-12 w-12 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="h-6 w-6 text-rose-500" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-bold text-slate-800 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            onClick={() => { setFile(null); setAnalysis(null); }}
                                            className="text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <Button
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Generate AI Score
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pro Tips */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
                        <CardContent className="p-6">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                Pro Tips
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex gap-2">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    Quantify your impact with numbers.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    Tailor keywords to the job description.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-emerald-400 font-bold">•</span>
                                    Keep formatting clean and ATS-friendly.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Result Section */}
                <div className="space-y-4">
                    {analysis ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
                            {/* Score Card */}
                            <Card className="border-none shadow-lg bg-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Sparkles className="h-32 w-32" />
                                </div>
                                <CardContent className="p-8 text-center relative z-10">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">ATS Suitability Score</h3>

                                    <div className="relative inline-flex items-center justify-center mb-4">
                                        <div className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br ${getScoreColor(analysis.score)}`}>
                                            {analysis.score}
                                        </div>
                                        <div className="text-2xl font-bold text-slate-300 ml-1">/100</div>
                                    </div>

                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${getScoreColor(analysis.score)}`}
                                            style={{ width: `${analysis.score}%` }}
                                        />
                                    </div>

                                    <p className="text-slate-600 font-medium italic">"{analysis.summary}"</p>
                                </CardContent>
                            </Card>

                            {/* Detailed Feedback */}
                            <div className="grid gap-3">
                                <Card className="bg-emerald-50/50 border-emerald-100">
                                    <CardContent className="p-4">
                                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="h-4 w-4" /> Strong Points
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.strengths.map((str, i) => (
                                                <li key={i} className="text-sm text-emerald-700 flex gap-2">
                                                    <span>•</span> {str}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="bg-amber-50/50 border-amber-100">
                                    <CardContent className="p-4">
                                        <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-4 w-4" /> Areas for Improvement
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.improvements.map((imp, i) => (
                                                <li key={i} className="text-sm text-amber-700 flex gap-2">
                                                    <span>•</span> {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        // Empty State / Placeholder
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30">
                            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Sparkles className="h-10 w-10 text-indigo-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-300 mb-2">
                                AI Analysis Pending
                            </h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm">
                                Upload your resume to see your score and actionable feedback here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
