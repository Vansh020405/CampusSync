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
                console.log("[AUTH] Student Authorize Attempt:", credentials?.rollNo);
                try {
                    if (!credentials?.rollNo || !credentials?.password) {
                        console.log("[AUTH] Missing student credentials");
                        return null;
                    }

                    const rollNo = credentials.rollNo.trim();
                    const student = await prisma.student.findFirst({
                        where: {
                            OR: [
                                { rollNo: rollNo },
                                { email: rollNo }
                            ]
                        }
                    });

                    if (!student) {
                        console.log("[AUTH] Student not found:", rollNo);
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, student.password);

                    if (!isPasswordValid) {
                        console.log("[AUTH] Invalid password for student:", rollNo);
                        return null;
                    }

                    console.log("[AUTH] Student Login Successful:", rollNo);
                    return {
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        role: "STUDENT",
                        rollNo: student.rollNo,
                        section: student.section,
                        batch: student.batch,
                        department: student.department,
                        semester: student.semester
                    };
                } catch (error) {
                    console.error("[AUTH] STUDENT AUTHORIZE ERROR:", error);
                    return null;
                }
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
                console.log("[AUTH] Faculty Authorize Attempt:", credentials?.facultyId);
                try {
                    if (!credentials?.facultyId || !credentials?.password) {
                        console.log("[AUTH] Missing faculty credentials");
                        return null;
                    }

                    const facultyId = credentials.facultyId.trim();
                    const faculty = await prisma.faculty.findFirst({
                        where: {
                            OR: [
                                { facultyId: facultyId },
                                { email: facultyId }
                            ]
                        }
                    });

                    if (!faculty) {
                        console.log("[AUTH] Faculty not found:", facultyId);
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, faculty.password);

                    if (!isPasswordValid) {
                        console.log("[AUTH] Invalid password for faculty:", facultyId);
                        return null;
                    }

                    const mentoredSections = await prisma.sectionMentor.findMany({
                        where: { facultyId: faculty.id }
                    });

                    console.log("[AUTH] Faculty Login Successful:", facultyId, `(Mentoring ${mentoredSections.length} sections)`);
                    return {
                        id: faculty.id,
                        name: faculty.name,
                        email: faculty.email,
                        role: "FACULTY",
                        facultyId: faculty.facultyId,
                        department: faculty.department,
                        subjects: faculty.subjects,
                        sectionsTeaching: faculty.sectionsTeaching,
                        cabinLocation: faculty.cabinLocation,
                        mentoredSections: JSON.stringify(mentoredSections)
                    };
                } catch (error) {
                    console.error("[AUTH] FACULTY AUTHORIZE ERROR:", error);
                    return null;
                }
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
                        username: admin.username,
                        position: admin.position,
                        department: admin.department,
                        subjects: admin.subjects
                    };
                } catch (error) {
                    console.error("ADMIN LOGIN ERROR:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                // Update token with new session data
                return { ...token, ...session.user };
            }
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.rollNo = (user as any).rollNo;
                token.facultyId = (user as any).facultyId;
                token.section = (user as any).section;
                token.username = (user as any).username;
                token.subjects = (user as any).subjects;
                token.sectionsTeaching = (user as any).sectionsTeaching;
                token.department = (user as any).department;
                token.semester = (user as any).semester;
                token.batch = (user as any).batch;
                token.mentoredSections = (user as any).mentoredSections;
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
                (session.user as any).sectionsTeaching = token.sectionsTeaching;
                (session.user as any).department = token.department;
                (session.user as any).semester = token.semester;
                (session.user as any).batch = token.batch;
                (session.user as any).mentoredSections = token.mentoredSections;
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
