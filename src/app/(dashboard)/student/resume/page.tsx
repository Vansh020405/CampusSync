'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText, Upload, Sparkles, AlertTriangle, AlertCircle, Loader2,
    Target, Briefcase, Award, Zap, Layout, FileSearch, CheckCircle2,
    XCircle, ChevronRight, Activity, Percent
} from "lucide-react"
import { cn } from "@/lib/utils";

const TECH_DICTIONARY = [
    "react", "react.js", "angular", "vue", "vue.js", "svelte", "next.js", "node.js",
    "express", "django", "flask", "spring boot", "ruby on rails", "laravel",
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php",
    "html", "css", "sass", "less", "tailwind", "bootstrap", "material ui",
    "sql", "mysql", "postgresql", "mongodb", "redis", "cassandra", "firebase", "supabase", "sqlite",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform",
    "git", "linux", "bash", "graphql", "rest api", "kafka", "rabbitmq", "machine learning", "tensorflow", "pytorch", "pandas"
];

const SECTIONS_DEF = [
    { key: "education", labels: ["education", "academic", "university"] },
    { key: "skills", labels: ["skills", "technologies", "tech stack"] },
    { key: "projects", labels: ["projects", "personal projects", "academic projects", "open source"] },
    { key: "experience", labels: ["experience", "work experience", "employment", "internship", "history"] },
    { key: "achievements", labels: ["achievements", "awards", "honors"] },
    { key: "certifications", labels: ["certifications", "certificates"] },
    { key: "summary", labels: ["summary", "profile", "objective"] }
];

const ACTION_VERBS = [
    "built", "developed", "designed", "implemented", "optimized", "led", "architected",
    "engineered", "created", "reduced", "increased", "improved", "managed", "spearheaded", "orchestrated"
];

const QUANTIFICATION_REGEX = /\b(\d+(?:\.\d+)?%|\d+\+?x?|\$[\d.]+[MBK]?)\b/gi;

type AnalysisResult = {
    overallScore: number;
    extractedTechStack: string[];
    sectionsDetected: string[];
    measurableMetrics: string[];
    missingElements: string[];
    improvementSuggestions: string[];
    breakdowns: {
        category: string;
        score: number;
        max: number;
        feedback: string;
    }[];
};

const ANALYSIS_STEPS = [
    { id: 'extract', label: 'Extracting clean text data...', duration: 1000 },
    { id: 'skills', label: 'Running exact-match skill detection...', duration: 1000 },
    { id: 'metrics', label: 'Evaluating depth & quantified impact...', duration: 1000 },
    { id: 'finalize', label: 'Enforcing strict scoring thresholds...', duration: 1000 },
];

export default function ResumeOptimizerPage() {
    const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
    const [rawText, setRawText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);
            setAnalysis(null);
            setCurrentStepIndex(0);

            // If Text file, read directly
            if (uploadedFile.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = (e) => setRawText(e.target?.result as string);
                reader.readAsText(uploadedFile);
            } else if (uploadedFile.type === "application/pdf") {
                // PDF Safe Extraction Pipeline
                setIsAnalyzing(true);
                const formData = new FormData();
                formData.append("file", uploadedFile);

                try {
                    const res = await fetch("/api/resume/parse", {
                        method: "POST",
                        body: formData,
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.isValid) {
                            setRawText(data.text);
                        } else {
                            alert(`PDF extraction quality is low: ${data.reason}. Please upload a cleaner PDF or paste resume text.`);
                            setRawText("");
                            setFile(null);
                        }
                    } else {
                        alert("Failed to parse PDF securely. Please paste text instead to avoid hallucinated scores.");
                        setRawText("");
                        setFile(null);
                    }
                } catch (error) {
                    alert("Error extracting text securely. Please use Paste Text.");
                    setRawText("");
                    setFile(null);
                } finally {
                    setIsAnalyzing(false);
                }
            } else {
                alert("Unsupported document type. Please use PDF or TXT.");
                setRawText("");
                setFile(null);
            }
        }
    };

    const runStrictAnalysis = (textToAnalyze: string) => {
        const textData = textToAnalyze.toLowerCase();
        const normalizedText = textData.replace(/[^a-z0-9+#.\s]/g, " ");
        const words = normalizedText.split(/\s+/).filter(w => w.length > 0);

        // 1. Structure & Completeness (15)
        let foundSections: string[] = [];
        let missingSections: string[] = [];
        SECTIONS_DEF.forEach(sec => {
            const hasSection = sec.labels.some(label => textData.includes(label));
            if (hasSection) foundSections.push(sec.key);
            else missingSections.push(sec.key);
        });

        const structureScore = Math.min(Math.round((foundSections.length / SECTIONS_DEF.length) * 15), 15);

        // 2. Skill Strength (20) - STRICT EXACT MATCH
        let extractedSkills: Set<string> = new Set();
        TECH_DICTIONARY.forEach(skill => {
            // Using regex bounds for exact word match
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            if (regex.test(normalizedText)) {
                extractedSkills.add(skill);
            }
        });
        const skillArray = Array.from(extractedSkills);
        const skillScore = Math.min(Math.round((skillArray.length / 10) * 20), 20);

        // 3. Project Quality (20) & Metrics Quantification
        let actionVerbsFound: string[] = [];
        ACTION_VERBS.forEach(verb => {
            if (new RegExp(`\\b${verb}\\b`, 'i').test(textData)) actionVerbsFound.push(verb);
        });

        let rawMatches = textToAnalyze.match(QUANTIFICATION_REGEX) || [];
        let uniqueMetrics = Array.from(new Set(rawMatches)).filter(m => parseInt(m) > 0 || m.includes('%'));

        let projectScore = 0;
        let projHasMetrics = uniqueMetrics.length > 0;

        if (foundSections.includes("projects")) {
            projectScore += 5;
            projectScore += Math.min(actionVerbsFound.length * 2, 8);
            projectScore += Math.min(uniqueMetrics.length * 2, 7);
        }

        if (!projHasMetrics && foundSections.includes("projects")) {
            projectScore = Math.min(projectScore, 10); // Cap at 50% max (10/20)
        }
        if (!foundSections.includes("projects")) {
            projectScore = Math.min(projectScore, 5); // Minimal score
        }

        // 4. Experience Depth (15)
        let expScore = 0;
        let hasInternship = textData.includes("intern") || textData.includes("internship");
        let hasExperience = foundSections.includes("experience") || hasInternship;
        let hasDuration = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}\b/i.test(textData) ||
            textData.includes("present");

        if (hasExperience) {
            expScore += 5;
            if (hasInternship) expScore += 5;
            if (hasDuration) expScore += 5;
        } else {
            expScore = 2; // heavily penalized
        }

        // 5. ATS Optimization (10)
        let atsScore = 10;
        let hasBullet = textToAnalyze.includes("â€¢") || textToAnalyze.includes("- ");
        if (!hasBullet) atsScore -= 4;
        if (words.length < 50) atsScore -= 5;

        // 6. Achievements & Certifications (10)
        let achScore = 0;
        if (foundSections.includes("achievements")) achScore += 3;
        if (foundSections.includes("certifications")) achScore += 3;
        if (textData.includes("hackathon") || textData.includes("open source") || textData.includes("open-source")) achScore += 4;

        // 7. Clarity & Consistency (10)
        let clarityScore = 10;
        if (words.length > 1000) clarityScore -= 3; // too long cap
        if (words.length < 150) clarityScore -= 5; // too short penalty

        // ENFORCEMENTS
        let totalScore = structureScore + skillScore + projectScore + expScore + atsScore + achScore + clarityScore;

        let suggestions: string[] = [];
        let missingCrit: string[] = [];

        if (uniqueMetrics.length < 3) {
            totalScore = Math.min(totalScore, 75);
            suggestions.push("Your impact is not quantified. Score capped at 75. Add %, $, or numbers to your bullets.");
            missingCrit.push("Measurable Metrics (< 3 found)");
        }

        if (!foundSections.includes("projects") && !hasExperience) {
            totalScore = Math.min(totalScore, 70);
            suggestions.push("Lacking both projects and experience. Score capped at 70.");
            missingCrit.push("Technical Projects / Experience");
        }

        if (skillArray.length === 0) {
            suggestions.push("No explicit technical skills found matching the dictionary. Use exact common tool names.");
        }

        if (!hasBullet) {
            suggestions.push("No bullet points detected. ATS systems prefer bulleted experience lists formatting.");
        }

        missingSections.forEach(s => {
            if (s === "summary") suggestions.push("Add a brief professional summary section.");
            if (s === "projects" && !missingCrit.includes("Technical Projects / Experience")) suggestions.push("Missing a dedicated Projects section.");
        });

        setAnalysis({
            overallScore: totalScore,
            extractedTechStack: skillArray,
            sectionsDetected: foundSections,
            measurableMetrics: uniqueMetrics,
            missingElements: missingCrit.length > 0 ? missingCrit : missingSections.slice(0, 3),
            improvementSuggestions: suggestions.length > 0 ? suggestions : ["Resume looks highly optimized. Continue matching keywords to specific job descriptions."],
            breakdowns: [
                { category: "Structure & Completeness", score: structureScore, max: 15, feedback: `${foundSections.length}/7 standard sections detected.` },
                { category: "Skill Strength & Relevance", score: skillScore, max: 20, feedback: `${skillArray.length} distinct technologies verified via exact match.` },
                { category: "Project Quality", score: projectScore, max: 20, feedback: projHasMetrics ? `Metrics and ${actionVerbsFound.length} action verbs found.` : `Score penalized. No measurable impact detected.` },
                { category: "Experience Depth", score: expScore, max: 15, feedback: hasExperience ? "Experience/internship detected." : "Heavy penalty applied for no experience." },
                { category: "ATS Optimization", score: atsScore, max: 10, feedback: hasBullet ? "Standard bullet lists found." : "Poor formatting detected." },
                { category: "Achievements & Certs", score: achScore, max: 10, feedback: achScore > 0 ? `Bonus achievements detected.` : `No hackathons or certs found.` },
                { category: "Clarity & Readability", score: clarityScore, max: 10, feedback: `Word count: ~${words.length}` }
            ]
        });

        // Fire asynchronous background task to sync to DB for AI Mentor visibility
        fetch('/api/student/resume/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: totalScore, text: textToAnalyze })
        }).catch(err => console.error("Failed to sync resume to AI Context:", err));
    };

    const triggerEvaluation = () => {
        const textToEvaluate = inputMode === 'paste' ? rawText : (rawText || "Software Engineer Intern. Built web app using react and node.js. Increased speed by 20%. Completed hackathon.");

        if (!textToEvaluate.trim()) {
            alert("No text to evaluate. Please paste resume text.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);
        setCurrentStepIndex(0);

        let currentIdx = 0;
        const executeStep = () => {
            if (currentIdx < ANALYSIS_STEPS.length) {
                setTimeout(() => {
                    currentIdx++;
                    setCurrentStepIndex(currentIdx);
                    executeStep();
                }, ANALYSIS_STEPS[currentIdx].duration);
            } else {
                runStrictAnalysis(textToEvaluate);
                setIsAnalyzing(false);
            }
        };

        executeStep();
    };

    const getScoreStyles = (score: number) => {
        if (score >= 85) return "text-emerald-500 from-emerald-400 to-teal-500 bg-emerald-50 border-emerald-200 stroke-emerald-500";
        if (score >= 70) return "text-amber-500 from-amber-400 to-orange-500 bg-amber-50 border-amber-200 stroke-amber-500";
        return "text-rose-500 from-rose-400 to-red-500 bg-rose-50 border-rose-200 stroke-rose-500";
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700 max-w-5xl mx-auto">
            {/* Premium Header */}
            <div className="relative -mx-3 -mt-3 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-xl shadow-indigo-500/10 mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 transition-all duration-700 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative px-4 py-8 md:px-10 text-center flex flex-col items-center">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1 font-black text-[8px] md:text-[10px] uppercase tracking-widest mb-3 shadow-none">
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse inline-block"></span>
                        STRICT ATS EVALUATION 
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-3 leading-tight uppercase ">
                        Resume Analyser
                    </h1>
                    <p className="text-indigo-100/80 font-black text-[10px] md:text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
                        Depth-based parser extracting exact matched logic for realistic evaluation.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-2xl w-full">
                        <button
                            onClick={() => setInputMode('upload')}
                            className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", inputMode === 'upload' ? "bg-white dark:bg-card text-indigo-600 dark:text-primary shadow-sm" : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground")}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setInputMode('paste')}
                            className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", inputMode === 'paste' ? "bg-white dark:bg-card text-indigo-600 dark:text-primary shadow-sm" : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground")}
                        >
                            Paste Text (Accurate)
                        </button>
                        
                    </div>

                    <Card className="border-none shadow-xl bg-white dark:bg-card rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6">
                            {inputMode === 'paste' ? (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-500 dark:text-muted-foreground">Paste your raw resume text to ensure strict evaluation logic runs perfectly without PDF parsing errors.</p>
                                    <textarea
                                        className="w-full h-64 p-4 rounded-xl border-2 border-slate-100 dark:border-border bg-white dark:bg-muted focus:border-indigo-500 dark:focus:border-primary focus:ring-0 outline-none text-sm text-slate-700 dark:text-foreground resize-none font-medium"
                                        placeholder="John Doe\nSoftware Engineer...\n\nExperience\n- Developed dashboard using React..."
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        disabled={isAnalyzing}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 text-center py-8">
                                    <input type="file" id="resume-upload" className="hidden" accept=".txt,.pdf" onChange={handleFileChange} disabled={isAnalyzing} />
                                    <div className="h-16 w-16 bg-indigo-50 dark:bg-muted rounded-[1.25rem] mx-auto flex items-center justify-center mb-4 border border-indigo-100/50 dark:border-border/50">
                                        {isAnalyzing ? <Loader2 className="h-8 w-8 text-indigo-500 dark:text-primary animate-spin" /> : <Upload className="h-8 w-8 text-indigo-500 dark:text-primary" />}
                                    </div>
                                    <h3 className="font-black text-slate-800 dark:text-foreground">Upload PDF</h3>
                                    <p className="text-xs font-bold text-slate-400 dark:text-muted-foreground px-4">Our strict extractor scrubs fragmented words and symbols to prevent hallucination.</p>
                                    <label htmlFor="resume-upload">
                                        <Button className="mt-4 bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground hover:bg-slate-800 dark:hover:bg-primary/90 pointer-events-none rounded-xl font-bold uppercase tracking-widest text-[10px] px-6" size="sm">Select Document</Button>
                                    </label>
                                    {file && !isAnalyzing && <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 max-w-[250px] mx-auto text-emerald-700 dark:text-emerald-400 font-bold text-xs truncate">
                                        <CheckCircle2 className="h-4 w-4 inline mr-1" /> {file.name} Verified
                                    </div>}
                                </div>
                            )}

                            {!analysis && (
                                <Button
                                    className="w-full h-12 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02]"
                                    onClick={triggerEvaluation}
                                    disabled={isAnalyzing || rawText.trim().length === 0}
                                >
                                    {isAnalyzing ? <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Rules Engine</span> : "Evaluate Resume Strictly"}
                                </Button>
                            )}

                            {isAnalyzing && (
                                <div className="space-y-3 pt-6 border-t border-slate-100 mt-6">
                                    {ANALYSIS_STEPS.map((step, idx) => {
                                        const isCompleted = currentStepIndex > idx;
                                        const isCurrent = currentStepIndex === idx;
                                        return (
                                            <div key={step.id} className={cn("flex items-center gap-3 transition-all", isCurrent ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30")}>
                                                {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : isCurrent ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" /> : <div className="h-4 w-4" />}
                                                <p className="text-xs font-bold text-slate-700">{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {analysis && (
                                <Button variant="outline" className="w-full h-12 mt-6 border-2 border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50" onClick={() => setAnalysis(null)}>
                                    Reset Analyzer
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Score Panel */}
                <div className="lg:col-span-7 space-y-6">
                    {!analysis && !isAnalyzing && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-border rounded-[2.5rem] bg-slate-50/50 dark:bg-muted/10">
                            <Target className="h-16 w-16 text-slate-300 dark:text-muted-foreground/30 mb-6" />
                            <h3 className="text-xl font-black text-slate-800 dark:text-foreground mb-2">Strict Reality Check</h3>
                            <p className="text-sm font-bold text-slate-500 dark:text-muted-foreground max-w-sm">Evaluates syntax, quantifications, exact tech overlaps, and semantic section structure realistically.</p>
                        </div>
                    )}

                    {analysis && (
                        <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6">

                            {/* Score Overview Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Circular Score */}
                                <Card className={cn("border-none shadow-md overflow-hidden flex flex-col items-center justify-center p-6 rounded-[2rem]", getScoreStyles(analysis.overallScore).split(' bg-')[0] + " " + "bg-white dark:bg-card")}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-4">Total Evaluation</p>
                                    <div className="relative">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="54" className="stroke-slate-100 dark:stroke-muted/30 fill-none" strokeWidth="12" />
                                            <circle cx="64" cy="64" r="54" className={cn("fill-none stroke-current transition-all duration-1000", getScoreStyles(analysis.overallScore).split(' ').find(c => c.startsWith('text-')))} strokeWidth="12" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * analysis.overallScore) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className={cn("text-4xl font-black tracking-tighter shrink-0", getScoreStyles(analysis.overallScore).split(' ').find(c => c.startsWith('text-')))}>{analysis.overallScore}</span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground/50">/ 100</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Missing Crit & Suggestions */}
                                <Card className="border-none shadow-md bg-white dark:bg-card rounded-[2rem] md:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <AlertTriangle className="h-24 w-24 dark:text-muted-foreground" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3 flex items-center gap-1"><XCircle className="h-3 w-3" /> Critical Enforcements & Caps</h4>
                                        <ul className="space-y-1.5 mb-4">
                                            {analysis.improvementSuggestions.slice(0, 3).map((s, i) => (
                                                <li key={i} className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-snug">â€¢ {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {analysis.missingElements.length > 0 && (
                                        <div className="pt-3 border-t border-slate-100 dark:border-border relative z-10">
                                            <span className="text-[10px] font-black text-amber-500 uppercase mr-2">Missing:</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-muted-foreground">{analysis.missingElements.join(", ")}</span>
                                        </div>
                                    )}
                                </Card>
                            </div>                             {/* Extractions Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="border-none shadow-sm rounded-[1.5rem] bg-white dark:bg-card">
                                    <CardContent className="p-5">
                                        <h4 className="text-[10px] font-black text-indigo-500 dark:text-primary uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Zap className="h-3.5 w-3.5" /> Verified Exact Skills ({analysis.extractedTechStack.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.extractedTechStack.length > 0 ? analysis.extractedTechStack.map(skill => (
                                                <Badge key={skill} variant="outline" className="text-slate-700 dark:text-muted-foreground bg-slate-50 dark:bg-muted border-slate-200 dark:border-border font-bold text-[10px] uppercase">{skill}</Badge>
                                            )) : <span className="text-xs text-slate-400 font-bold ">No exact matches found from dictionary.</span>}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm rounded-[1.5rem] bg-white dark:bg-card">
                                    <CardContent className="p-5">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <Percent className="h-3.5 w-3.5" /> Quantified Metrics ({analysis.measurableMetrics.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysis.measurableMetrics.length > 0 ? analysis.measurableMetrics.slice(0, 10).map((met, i) => (
                                                <Badge key={i} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none font-bold text-[10px] uppercase">{met}</Badge>
                                            )) : <span className="text-xs text-slate-400 font-bold ">No percentages or multipliers detected.</span>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>                             {/* Scoring Logic Breakdown */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-black text-slate-800 dark:text-foreground tracking-widest uppercase pl-2 mt-2">Section Strict Breakdown</h3>
                                {analysis.breakdowns.map((bk, i) => {
                                    const percentage = (bk.score / bk.max) * 100;
                                    return (
                                        <div key={i} className="bg-white dark:bg-card p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-border shadow-sm transition-all hover:border-indigo-100 dark:hover:border-primary/50">
                                            <div className="w-16 text-right shrink-0">
                                                <span className={cn("font-black", percentage < 50 ? "text-rose-500" : percentage < 80 ? "text-amber-500" : "text-emerald-500")}>{bk.score}</span>
                                                <span className="text-xs font-bold text-slate-400 dark:text-muted-foreground/50">/{bk.max}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-sm text-slate-800 dark:text-foreground truncate">{bk.category}</h5>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground truncate mt-0.5">{bk.feedback}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
