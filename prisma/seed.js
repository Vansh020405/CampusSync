const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.studentAttendance.deleteMany();
    await prisma.facultyAttendance.deleteMany();
    await prisma.message.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.timetable.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed Students
    const students = [
        { name: 'Rahul Sharma', rollNo: '23-4G2-01', section: '4G2', department: 'Computer Science', semester: '3', email: 'rahul@student.edu', password: hashedPassword },
        { name: 'Aditi Verma', rollNo: '23-4G2-02', section: '4G2', department: 'Computer Science', semester: '3', email: 'aditi@student.edu', password: hashedPassword },
        { name: 'Ishaan Singh', rollNo: '23-4G3-01', section: '4G3', department: 'Data Science', semester: '3', email: 'ishaan@student.edu', password: hashedPassword },
        { name: 'Sneha Gupta', rollNo: '23-4G3-02', section: '4G3', department: 'Data Science', semester: '3', email: 'sneha@student.edu', password: hashedPassword },
        { name: 'Kabir Das', rollNo: '23-4G2-03', section: '4G2', department: 'Computer Science', semester: '3', email: 'kabir@student.edu', password: hashedPassword },
    ];

    for (const student of students) {
        await prisma.student.create({ data: student });
    }

    // Seed Faculty
    const faculty = [
        {
            name: 'Sumit Sharma',
            facultyId: 'FAC-SUMIT-01',
            department: 'Computer Science',
            subjects: ['Java Programming', 'Data Structures'],
            sectionsTeaching: ['4G2', '4G3'],
            cabinLocation: 'Block A-302',
            password: hashedPassword
        },
        {
            name: 'Dr. Neha Kapoor',
            facultyId: 'FAC-NEHA-02',
            department: 'Mathematics',
            subjects: ['Applied Probability'],
            sectionsTeaching: ['4G2'],
            cabinLocation: 'Block B-105',
            password: hashedPassword
        },
        {
            name: 'Vikram Seth',
            facultyId: 'FAC-VIKRAM-03',
            department: 'Computer Science',
            subjects: ['DBMS'],
            sectionsTeaching: ['4G3'],
            cabinLocation: 'Block A-305',
            password: hashedPassword
        },
    ];

    for (const f of faculty) {
        await prisma.faculty.create({
            data: {
                ...f,
                subjects: JSON.stringify(f.subjects),
                sectionsTeaching: JSON.stringify(f.sectionsTeaching)
            }
        });
    }

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
