'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';

type Role = 'student' | 'faculty';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === 'FACULTY') {
        router.push('/faculty');
      } else {
        router.push('/home');
      }
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const providerId = selectedRole === 'student' ? 'student-credentials' : 'faculty-credentials';
    const payload = selectedRole === 'student'
      ? { rollNo: identifier, password }
      : { facultyId: identifier, password };

    const res = await signIn(providerId, {
      ...payload,
      redirect: false,
    });

    if (res?.error) {
      setError("Institutional rejection: Invalid credentials provided.");
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-12 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#020617] tracking-tighter">
            CampusSync
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Institutional Hub Access
          </p>
        </div>

        <Card className="border-none shadow-sm bg-[#F8FAFC] rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <div className="flex p-1 bg-white rounded-xl border border-slate-100 mb-8">
              <button
                type="button"
                onClick={() => { setSelectedRole('student'); setError(""); setIdentifier(""); }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedRole === 'student' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('faculty'); setError(""); setIdentifier(""); }}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedRole === 'faculty' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Faculty
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                  {selectedRole === 'student' ? 'Roll Number' : 'Faculty ID'}
                </label>
                <Input
                  placeholder={selectedRole === 'student' ? "e.g. 23-4G2-01" : "e.g. FAC-501"}
                  className="h-12 rounded-xl bg-white border-slate-100 focus-visible:ring-indigo-600 font-bold placeholder:text-slate-200"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</label>
                  <button type="button" className="text-[9px] font-bold text-slate-300 uppercase hover:text-slate-900 transition-colors">Forgot?</button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-white border-slate-100 focus-visible:ring-indigo-600 font-bold placeholder:text-slate-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 mt-4"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Authorize Access"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 text-center space-y-4">
          <Link href="/auth/admin/login" className="text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Terminal Secure Access
          </Link>
          <div className="text-[8px] font-black text-slate-200 uppercase tracking-[0.4em]">
            Institutional Sync Network v4.0
          </div>
        </div>
      </div>
    </div>
  );
}
