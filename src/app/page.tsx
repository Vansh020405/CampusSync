'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, GraduationCap, ShieldCheck, User, Mail, Lock, Hash, Book, Layers, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { BrandLogo } from "@/components/brand/Logo";

type Role = 'student' | 'faculty';
type Tab = 'login' | 'signup';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    identifier: "", // rollNo or facultyId
    email: "",
    password: "",
    semester: "",
    section: "",
    batch: "Morning",
    department: "CSE", // Fallback for student
    departments: [] as string[], // For faculty
    subjects: [] as string[],
    cabin: ""
  });

  const [subjectInput, setSubjectInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(session.user.role === 'FACULTY' ? '/faculty' : '/home');
    }
  }, [status, session, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (activeTab === 'login') {
      const providerId = selectedRole === 'student' ? 'student-credentials' : 'faculty-credentials';
      const payload = selectedRole === 'student'
        ? { rollNo: formData.identifier, password: formData.password }
        : { facultyId: formData.identifier, password: formData.password };

      const res = await signIn(providerId, {
        ...payload,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid login details. Please try again.");
        setLoading(false);
      } else {
        window.location.reload();
      }
    } else {
      // Signup logic
      const endpoint = selectedRole === 'student'
        ? '/api/auth/signup/student'
        : '/api/auth/signup/faculty';

      const payload = selectedRole === 'student'
        ? {
          name: formData.name,
          rollNo: formData.identifier,
          semester: formData.semester,
          section: formData.section,
          batch: formData.batch,
          email: formData.email,
          password: formData.password,
          department: formData.department
        }
        : {
          name: formData.name,
          facultyId: formData.identifier,
          email: formData.email,
          password: formData.password,
          department: formData.departments,
          subjects: formData.subjects,
          sectionsTeaching: [],
          cabinLocation: formData.cabin
        };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          setSuccessMessage("Account created! You can now login.");
          setActiveTab('login');
          setFormData(prev => ({ ...prev, password: "" }));
        } else {
          setError(data.error || "Creation failed. Please try again.");
        }
      } catch (err) {
        setError("System error. Connection refused.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans selection:bg-indigo-100">
      <div className="w-full max-w-[440px]">
        <div className="mb-12 flex flex-col items-center">
          <BrandLogo size={64} withText className="mb-2" />
          <div className="h-0.5 w-12 bg-slate-100 mt-4 rounded-full" />
        </div>

        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200/50">
            <button
              onClick={() => { setActiveTab('login'); setError(""); }}
              className={cn(
                "flex-1 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                activeTab === 'login' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-500"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(""); }}
              className={cn(
                "flex-1 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                activeTab === 'signup' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-500"
              )}
            >
              Sign Up
            </button>
          </div>

          <Card className="border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10">
              {/* Role Switcher */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setSelectedRole('student')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    selectedRole === 'student' ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Student</span>
                </button>
                <button
                  onClick={() => setSelectedRole('faculty')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    selectedRole === 'faculty' ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Faculty</span>
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-5">
                {activeTab === 'signup' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                      <Input
                        placeholder="e.g. Vansh Bansal"
                        className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 placeholder:font-medium transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">
                    {selectedRole === 'student' ? 'Roll Number' : 'Employee ID'}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                      placeholder={selectedRole === 'student' ? "e.g. 23-4G2-01" : "e.g. FAC-501"}
                      className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 placeholder:font-medium transition-all"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {activeTab === 'signup' && selectedRole === 'student' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Semester</label>
                        <div className="relative">
                          <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                          <Input
                            placeholder="4"
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Section</label>
                        <div className="relative">
                          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                          <Input
                            placeholder="4G2"
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Batch</label>
                        <select
                          className="w-full h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold px-4 text-sm outline-none transition-all"
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                          required
                        >
                          <option value="Morning">Morning Batch</option>
                          <option value="Evening">Evening Batch</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Department</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                          <Input
                            placeholder="e.g. BE-CSE"
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'signup' && selectedRole === 'faculty' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Add Departments</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                          <Input
                            placeholder="e.g. Dept. of CSE"
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                            value={departmentInput}
                            onChange={(e) => setDepartmentInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (departmentInput) {
                                  setFormData(prev => ({ ...prev, departments: [...prev.departments, departmentInput] }));
                                  setDepartmentInput("");
                                }
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            if (departmentInput) {
                              setFormData(prev => ({ ...prev, departments: [...prev.departments, departmentInput] }));
                              setDepartmentInput("");
                            }
                          }}
                          className="h-14 px-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                        {formData.departments.map(d => (
                          <div key={d} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                            {d}
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, departments: prev.departments.filter(i => i !== d) }))} className="text-slate-400 hover:text-slate-900 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Add Subjects</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                          <Input
                            placeholder="Enter subject..."
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (subjectInput) {
                                  setFormData(prev => ({ ...prev, subjects: [...prev.subjects, subjectInput] }));
                                  setSubjectInput("");
                                }
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            if (subjectInput) {
                              setFormData(prev => ({ ...prev, subjects: [...prev.subjects, subjectInput] }));
                              setSubjectInput("");
                            }
                          }}
                          className="h-14 px-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                        {formData.subjects.map(s => (
                          <div key={s} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                            {s}
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(i => i !== s) }))} className="text-slate-400 hover:text-slate-900 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5 group">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">Office / Cabin Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors" />
                        <Input
                          placeholder="e.g. Block A, Room 301"
                          className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold transition-all"
                          value={formData.cabin}
                          onChange={(e) => setFormData({ ...formData, cabin: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'signup' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">
                      College Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors group-focus-within:text-slate-900" />
                      <Input
                        type="email"
                        placeholder="username.be23@chitkara.edu.in"
                        className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Password</label>
                    {activeTab === 'login' && (
                      <button type="button" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors">Recover</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors group-focus-within:text-slate-900" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-12 h-14 rounded-2xl bg-white border-slate-100 focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-16 bg-slate-900 text-white hover:bg-black rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 mt-6 group transition-all"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <span className="flex items-center gap-3">
                      {activeTab === 'login' ? "Log In" : "Sign Up"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Link href="/auth/admin/login" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-2 group">
              <ShieldCheck className="w-4 h-4 text-slate-200 group-hover:text-indigo-500 transition-colors" /> Admin Login
            </Link>
            <div className="flex flex-col gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">
                CampusSync v4.2
              </div>
              <div className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Student & Faculty Portal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
