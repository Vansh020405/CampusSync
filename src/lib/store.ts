'use client';

import { useState } from 'react';

// Create a mock context or hook for database interactions since we don't have a real DB
// This stores data in-memory or localStorage for demo purposes

interface Internship {
    id: number;
    company: string;
    role: string;
    stipend: string;
    location: string;
    mode: string;
    deadline: string;
    eligibilityCgpa: number;
    branchesAllowed: string[];
    description: string;
    applyLink: string;
    skills: string[];
    postedDate: string;
}

interface Application {
    id: number;
    studentId: string;
    internshipId: number;
    status: 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
    appliedAt: string;
}

const DEMO_INTERNSHIPS: Internship[] = [
    {
        id: 1,
        company: "TechCorp Inc.",
        role: "SDE Intern",
        stipend: "₹50,000/mo",
        location: "Bangalore",
        mode: "Hybrid",
        deadline: "2026-03-01",
        eligibilityCgpa: 8.0,
        branchesAllowed: ["CSE", "ECE"],
        description: "Join our core engineering team to build scalable systems.",
        applyLink: "https://techcorp.com/careers",
        skills: ["Java", "React", "System Design"],
        postedDate: "2 days ago"
    },
    {
        id: 2,
        company: "DataWise Analytics",
        role: "Data Science Intern",
        stipend: "₹45,000/mo",
        location: "Remote",
        mode: "Remote",
        deadline: "2026-03-05",
        eligibilityCgpa: 7.5,
        branchesAllowed: ["CSE", "IT", "Math"],
        description: "Work on cutting-edge ML models.",
        applyLink: "https://datawise.com/jobs",
        skills: ["Python", "TensorFlow", "SQL"],
        postedDate: "1 day ago"
    },
    {
        id: 3,
        company: "BuildIt",
        role: "Frontend Developer",
        stipend: "₹30,000/mo",
        location: "Mumbai",
        mode: "Onsite",
        deadline: "2026-03-10",
        eligibilityCgpa: 6.5,
        branchesAllowed: ["All"],
        description: "Create beautiful user interfaces.",
        applyLink: "https://buildit.io/hiring",
        skills: ["React", "Tailwind CSS", "Figma"],
        postedDate: "Just now"
    },
    {
        id: 4,
        company: "CyberSafe",
        role: "Security Analyst",
        stipend: "₹40,000/mo",
        location: "Gurgaon",
        mode: "Onsite",
        deadline: "2026-03-15",
        eligibilityCgpa: 7.0,
        branchesAllowed: ["CSE", "IT"],
        description: "Analyze and secure network infrastructure.",
        applyLink: "https://cybersafe.com/jobs",
        skills: ["Network Security", "Linux", "Python"],
        postedDate: "3 days ago"
    },
    {
        id: 5,
        company: "CloudNine",
        role: "DevOps Intern",
        stipend: "₹55,000/mo",
        location: "Bangalore",
        mode: "Remote",
        deadline: "2026-03-12",
        eligibilityCgpa: 8.0,
        branchesAllowed: ["CSE"],
        description: "Automate deployment pipelines.",
        applyLink: "https://cloudnine.com/careers",
        skills: ["AWS", "Docker", "Kubernetes"],
        postedDate: "5 hours ago"
    }
];

export const useStore = () => {
    // Basic in-memory store hook simulation
    const [internships, setInternships] = useState<Internship[]>(DEMO_INTERNSHIPS);
    const [applications, setApplications] = useState<Application[]>([]);

    const addInternship = (internship: Omit<Internship, 'id'>) => {
        const newId = Math.max(...internships.map(i => i.id), 0) + 1;
        setInternships([...internships, { ...internship, id: newId }]);
    };

    const applyToInternship = (studentId: string, internshipId: number) => {
        if (applications.some(a => a.studentId === studentId && a.internshipId === internshipId)) return;

        const newApp: Application = {
            id: Math.max(...applications.map(a => a.id), 0) + 1,
            studentId,
            internshipId,
            status: 'APPLIED',
            appliedAt: new Date().toISOString()
        };
        setApplications([...applications, newApp]);
    };

    const saveInternship = (studentId: string, internshipId: number) => {
        if (applications.some(a => a.studentId === studentId && a.internshipId === internshipId)) return;

        const newApp: Application = {
            id: Math.max(...applications.map(a => a.id), 0) + 1,
            studentId,
            internshipId,
            status: 'SAVED',
            appliedAt: new Date().toISOString()
        };
        setApplications([...applications, newApp]);
    }

    const getStudentApplications = (studentId: string) => {
        return applications.filter(a => a.studentId === studentId).map(app => {
            const internship = internships.find(i => i.id === app.internshipId);
            return { application: app, internship };
        });
    };

    return {
        internships,
        addInternship,
        applyToInternship,
        saveInternship,
        getStudentApplications
    };
};

// Faculty and Booking Types
export interface Faculty {
    id: number;
    name: string;
    email: string;
    facultyConnectId: string; // FAC-1023 or CSE-SHARMA-21
    department: string;
    cabin: string;
    subjects: string[];
    sections: string[]; // Linked sections
    phone: string;
    bio: string;
    isAvailable: boolean;
    avatar?: string;
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    receiverSection: string;
    message: string;
    timestamp: string;
    type: 'BROADCAST' | 'DIRECT';
}

// Real-time Event System
type RealtimeEvent =
    | { type: 'ATTENDANCE_UPDATE'; data: { studentId: number; subject: string; percentage: number } }
    | { type: 'NEW_BROADCAST'; data: Message };

const CHANNEL_NAME = 'campus_sync_realtime';

export const broadcastEvent = (event: RealtimeEvent) => {
    if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage(event);
        channel.close();
    }
};

export interface TimeSlot {
    id: number;
    facultyId: number;
    day: string;
    startTime: string;
    endTime: string;
    isFree: boolean;
    subject?: string;
    room?: string;
}

export interface Booking {
    id: number;
    studentId: number;
    studentName: string;
    studentEmail: string;
    facultyId: number;
    slotDate: string;
    slotTime: string;
    agenda: string;
    agendaType: 'INTERNSHIP' | 'RESUME' | 'DOUBT' | 'RESEARCH' | 'OTHER';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    createdAt: string;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    rollNo: string;
    section: string;
    branch: string;
    year: number;
    avatar?: string;
    attendance: Record<string, number>; // subject -> percentage
    isVerified: boolean;
}

// Demo Faculty Data
export const DEMO_FACULTY: Faculty[] = [
    {
        id: 1,
        name: "Sumit",
        email: "sumit@campus.edu",
        facultyConnectId: "JAVA-SUMIT-01",
        department: "Computer Science",
        cabin: "Block A, Room 301",
        subjects: ["Java", "Java Lab"],
        sections: ["4G2", "4G3"],
        phone: "+91 98765 43210",
        bio: "Java expert with extensive experience in backend development and object-oriented programming.",
        isAvailable: true
    },
    {
        id: 2,
        name: "Dr. Priya Sharma",
        email: "priya.sharma@campus.edu",
        facultyConnectId: "CSE-SHARMA-02",
        department: "Computer Science",
        cabin: "Block A, Room 305",
        subjects: ["Operating Systems", "Computer Networks", "Cloud Computing"],
        sections: ["4G2", "4G1"],
        phone: "+91 98765 43211",
        bio: "Specializes in distributed systems and cloud architecture. Industry experience at major tech companies.",
        isAvailable: true
    },
    {
        id: 3,
        name: "Prof. Amit Verma",
        email: "amit.verma@campus.edu",
        facultyConnectId: "ECE-VERMA-03",
        department: "Electronics",
        cabin: "Block B, Room 201",
        subjects: ["Digital Electronics", "Microprocessors", "VLSI Design"],
        sections: ["ECE-A"],
        phone: "+91 98765 43212",
        bio: "Expert in VLSI and embedded systems. Published 50+ research papers.",
        isAvailable: false
    },
    {
        id: 4,
        name: "Dr. Sneha Patel",
        email: "sneha.patel@campus.edu",
        facultyConnectId: "CSE-PATEL-04",
        department: "Computer Science",
        cabin: "Block A, Room 310",
        subjects: ["Machine Learning", "Artificial Intelligence", "Data Mining"],
        sections: ["4G2", "4G3"],
        phone: "+91 98765 43213",
        bio: "AI researcher with focus on deep learning and computer vision. Former Google Research scientist.",
        isAvailable: true
    },
    {
        id: 5,
        name: "Prof. Vikram Singh",
        email: "vikram.singh@campus.edu",
        facultyConnectId: "MATH-SINGH-05",
        department: "Mathematics",
        cabin: "Block C, Room 105",
        subjects: ["Linear Algebra", "Probability", "Statistics"],
        sections: ["4G1", "4G2", "4G3"],
        phone: "+91 98765 43214",
        bio: "Mathematics professor specializing in applied statistics and data analysis.",
        isAvailable: true
    }
];

// Demo Timetable Data - Purged
export const DEMO_TIMETABLE: TimeSlot[] = [];

// Demo Bookings
export const DEMO_BOOKINGS: Booking[] = [
    {
        id: 1,
        studentId: 1,
        studentName: "Rahul Sharma",
        studentEmail: "rahul@student.edu",
        facultyId: 1,
        slotDate: "2026-02-17",
        slotTime: "10:00-11:00",
        agenda: "Need guidance on internship preparation and resume review",
        agendaType: "INTERNSHIP",
        status: "APPROVED",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        studentId: 2,
        studentName: "Priya Gupta",
        studentEmail: "priya@student.edu",
        facultyId: 2,
        slotDate: "2026-02-16",
        slotTime: "11:00-12:00",
        agenda: "Doubt in OS process scheduling algorithms",
        agendaType: "DOUBT",
        status: "PENDING",
        createdAt: new Date().toISOString()
    }
];
// Demo Students
export const DEMO_STUDENTS: Student[] = [
    {
        id: 1,
        name: "Rahul Sharma",
        email: "rahul@student.edu",
        rollNo: "CSE-23-4G2-01",
        section: "4G2",
        branch: "CSE",
        year: 3,
        attendance: {
            "Java": 85,
            "OS": 78,
            "DBMS": 92
        },
        isVerified: true
    }
];

// Static matrices purged. Real-time API sync prioritized.
export const STUDENT_TIMETABLE_4G2 = [];
