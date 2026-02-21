'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, Users, BookOpen, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { useSession } from "next-auth/react";

interface GradeRow {
    Sno: string;
    RollNumber: string;
    Name: string;
    Subject: string;
    ST1Marks: string;
    ST1TotalMarks: string;
    ST2Marks: string;
    ST2TotalMarks: string;
    EndTermMarks: string;
    EndTermTotalMarks: string;
    Grade: string;
    Credits: string;
}

export default function FacultyGradesPage() {
    const { data: session } = useSession();
    const facultySubjectsRaw = (session?.user as any)?.subjects;
    let facultySubjects: string[] = [];

    if (Array.isArray(facultySubjectsRaw)) {
        facultySubjects = facultySubjectsRaw;
    } else if (typeof facultySubjectsRaw === 'string') {
        try {
            facultySubjects = facultySubjectsRaw.startsWith('[')
                ? JSON.parse(facultySubjectsRaw)
                : facultySubjectsRaw.split(',').map(s => s.trim());
        } catch (e) {
            facultySubjects = [facultySubjectsRaw];
        }
    }

    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<GradeRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    const getComponentPercentage = (marks: string, total: string) => {
        if (!marks || !total) return '-';
        const m = parseFloat(marks);
        const t = parseFloat(total);
        if (t === 0) return '-';
        return ((m / t) * 100).toFixed(1) + '%';
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];

                // Map to required interface, handling potential column name mismatches
                const formattedData: GradeRow[] = data.map(row => ({
                    Sno: row['Sno'] || row['S.No'] || '',
                    RollNumber: row['Roll Number'] || row['Roll No'] || row['RollNumber'] || '',
                    Name: row['Name'] || '',
                    Subject: row['Subject'] || '',
                    ST1Marks: row['ST1 Marks'] || '',
                    ST1TotalMarks: row['ST1 Total Marks'] || '',
                    ST2Marks: row['ST2 Marks'] || '',
                    ST2TotalMarks: row['ST2 Total Marks'] || '',
                    EndTermMarks: row['End Term Marks'] || '',
                    EndTermTotalMarks: row['End Term Total Marks'] || '',
                    Grade: row['Grade'] || '',
                    Credits: row['Credits'] || '3'
                }));

                setParsedData(formattedData.filter(d => d.RollNumber && d.Subject));
                setIsParsing(false);
                toast.success(`Successfully parsed ${formattedData.length} records.`);
            },
            error: (error) => {
                toast.error("Failed to parse CSV file.");
                setIsParsing(false);
            }
        });
    };

    const handleDownloadTemplate = () => {
        const subjectName = selectedSubject || "AI & DS";
        const template = [
            "Sno,Roll Number,Name,Subject,ST1 Marks,ST1 Total Marks,ST2 Marks,ST2 Total Marks,End Term Marks,End Term Total Marks,Grade,Credits",
            `1,2410992641,Vansh Bansal,${subjectName},25,30,28,30,45,50,A,4`,
            `2,2410992617,Rahul Sharma,${subjectName},22,30,,,,,,,`
        ].join('\n');

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Grade_Upload_Template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDeploy = async () => {
        if (parsedData.length === 0) return;
        setIsDeploying(true);

        try {
            const res = await fetch('/api/faculty/grades/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades: parsedData })
            });

            if (!res.ok) throw new Error("Failed to deploy grades.");

            toast.success("Grades deployed successfully to the Academic Intelligence System.");
            setParsedData([]);
        } catch (error) {
            toast.error("Deployment failed. Check server logs.");
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 pb-24 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grades Deployment</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Academic Intelligence System</p>
            </div>

            {!selectedSubject ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Select Subject</h2>
                    </div>
                    {facultySubjects.length === 0 ? (
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                                <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
                                <h3 className="text-lg font-black text-slate-700">No Subjects Assigned</h3>
                                <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">
                                    You have not been assigned any subjects yet. Contact the administrator to get subjects assigned to your profile.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {facultySubjects.map((sub, idx) => {
                                const subjectName = sub.trim();
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSubject(subjectName)}
                                        className="text-left w-full group"
                                    >
                                        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white hover:-translate-y-1">
                                            <CardContent className="p-6">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors duration-300">
                                                    <BookOpen className="h-6 w-6 text-indigo-500 group-hover:text-white transition-colors duration-300" />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight">
                                                    {subjectName}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                                    Manage Grades
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white hover:bg-slate-100 rounded-full h-10 w-10 border border-slate-200 shadow-sm"
                            onClick={() => {
                                setSelectedSubject(null);
                                setParsedData([]);
                            }}
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{selectedSubject}</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Deployment Workspace</p>
                        </div>
                    </div>

                    {/* Action Buttons Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Data Operations</h2>
                            <p className="text-xs text-slate-500 font-medium">Download layout framework or insert validated CSV database.</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                onClick={handleDownloadTemplate}
                                variant="outline"
                                className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs shadow-sm flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" /> Get Template
                            </Button>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isParsing || isDeploying}
                                />
                                <Button
                                    className="h-10 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-xs shadow-md shadow-indigo-100 flex items-center gap-2 pointer-events-none"
                                >
                                    {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload CSV
                                </Button>
                            </div>
                        </div>
                    </div>

                    {parsedData.length > 0 && (
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black text-white">Preview Pipeline</CardTitle>
                                    <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                        Validated {parsedData.length} entries ready for deployment
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs h-12 px-6 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                                >
                                    {isDeploying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                    Deploy Grades System
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Sno</th>
                                            <th className="px-6 py-4">Roll Number</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4">ST1</th>
                                            <th className="px-6 py-4">ST2</th>
                                            <th className="px-6 py-4">EndTerm</th>
                                            <th className="px-6 py-4">Overall Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                        {parsedData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">{row.Sno}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{row.RollNumber}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{row.Name}</td>
                                                <td className="px-6 py-4">{row.Subject}</td>
                                                <td className="px-6 py-4">
                                                    {row.ST1Marks} / {row.ST1TotalMarks || '-'}
                                                    {row.ST1Marks && <span className="ml-2 text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{getComponentPercentage(row.ST1Marks, row.ST1TotalMarks)}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {row.ST2Marks} / {row.ST2TotalMarks || '-'}
                                                    {row.ST2Marks && <span className="ml-2 text-[10px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">{getComponentPercentage(row.ST2Marks, row.ST2TotalMarks)}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {row.EndTermMarks} / {row.EndTermTotalMarks || '-'}
                                                    {row.EndTermMarks && <span className="ml-2 text-[10px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">{getComponentPercentage(row.EndTermMarks, row.EndTermTotalMarks)}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {row.Grade ? (
                                                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-black">{row.Grade}</span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                    {selectedSubject && parsedData.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <FileSpreadsheet className="h-12 w-12 text-slate-200 mb-4" />
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">No Data Yet</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Upload a CSV file to preview the pipeline.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
