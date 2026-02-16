import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "student-credentials",
            name: "Student Login",
            credentials: {
                rollNo: { label: "Roll Number", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("Student Authorize called with:", credentials);
                if (!credentials?.rollNo || !credentials?.password) return null;

                const student = await prisma.student.findFirst({
                    where: {
                        OR: [
                            { rollNo: credentials.rollNo },
                            { email: credentials.rollNo }
                        ]
                    }
                });

                if (!student) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, student.password);

                if (!isPasswordValid) return null;

                return {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    role: "STUDENT",
                    rollNo: student.rollNo,
                    section: student.section
                };
            }
        }),
        CredentialsProvider({
            id: "faculty-credentials",
            name: "Faculty Login",
            credentials: {
                facultyId: { label: "Faculty ID", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.facultyId || !credentials?.password) return null;

                const faculty = await prisma.faculty.findFirst({
                    where: {
                        OR: [
                            { facultyId: credentials.facultyId },
                            { email: credentials.facultyId }
                        ]
                    }
                });

                if (!faculty) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, faculty.password);

                if (!isPasswordValid) return null;

                return {
                    id: faculty.id,
                    name: faculty.name,
                    email: null,
                    role: "FACULTY",
                    facultyId: faculty.facultyId,
                    department: faculty.department,
                    subjects: faculty.subjects
                };
            }
        }),
        CredentialsProvider({
            id: "admin-credentials",
            name: "Admin Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials?.password) return null;

                    const admin = await prisma.admin.findUnique({
                        where: { username: credentials.username }
                    });

                    // For demo purposes, if no admin exists, create a default one
                    if (!admin && credentials.username === "admin" && credentials.password === "admin123") {
                        // Create default admin for first run
                        const hashedPassword = await bcrypt.hash("admin123", 10);
                        const newAdmin = await prisma.admin.create({
                            data: {
                                username: "admin",
                                password: hashedPassword,
                                name: "System Admin"
                            }
                        });
                        return {
                            id: newAdmin.id,
                            name: newAdmin.name,
                            email: null,
                            role: "ADMIN",
                            username: newAdmin.username
                        };
                    }

                    if (!admin) {
                        console.log("Admin not found:", credentials.username);
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);

                    if (!isPasswordValid) {
                        console.log("Invalid password for admin:", credentials.username);
                        return null;
                    }

                    console.log("✅ Admin login successful:", admin.username);
                    return {
                        id: admin.id,
                        name: admin.name,
                        email: null,
                        role: "ADMIN",
                        username: admin.username
                    };
                } catch (error) {
                    console.error("ADMIN LOGIN ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.rollNo = (user as any).rollNo;
                token.facultyId = (user as any).facultyId;
                token.section = (user as any).section;
                token.username = (user as any).username;
                token.subjects = (user as any).subjects;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).rollNo = token.rollNo;
                (session.user as any).facultyId = token.facultyId;
                (session.user as any).section = token.section;
                (session.user as any).username = token.username;
                (session.user as any).subjects = token.subjects;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
    debug: true, // Enable debug mode
};
