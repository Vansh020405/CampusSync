
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Syllabus Data...')

    // 1. Create Core Subjects
    const java = await prisma.syllabusSubject.upsert({
        where: { subjectName: 'Java Programming' },
        update: {},
        create: {
            subjectName: 'Java Programming',
            subjectCode: 'CS201',
            department: 'CSE',
            topics: {
                create: [
                    { title: 'Introduction to Java', totalLectures: 1, order: 1 },
                    { title: 'JVM Architecture', totalLectures: 1, order: 2 },
                    { title: 'Data Types & Variables', totalLectures: 1, order: 3 },
                    { title: 'Operators & Expressions', totalLectures: 1, order: 4 },
                    { title: 'Control Flow (If/Else/Switch)', totalLectures: 2, order: 5 },
                    { title: 'Loops (For/While/Do-While)', totalLectures: 2, order: 6 },
                    { title: 'Object-Oriented Programming (OOP) Basics', totalLectures: 1, order: 7 },
                    { title: 'Classes & Objects', totalLectures: 2, order: 8 },
                    { title: 'Constructors & This Keyword', totalLectures: 1, order: 9 },
                    { title: 'Inheritance & Polymorphism', totalLectures: 2, order: 10 },
                    { title: 'Encapsulation & Abstraction', totalLectures: 1, order: 11 },
                    { title: 'Interfaces & Abstract Classes', totalLectures: 2, order: 12 },
                    { title: 'Exception Handling', totalLectures: 2, order: 13 },
                    { title: 'Input/Output (I/O) Streams', totalLectures: 2, order: 14 },
                    { title: 'Collections Framework', totalLectures: 3, order: 15 },
                ]
            }
        }
    })

    const dbms = await prisma.syllabusSubject.upsert({
        where: { subjectName: 'Database Management Systems' },
        update: {},
        create: {
            subjectName: 'Database Management Systems',
            subjectCode: 'CS202',
            department: 'CSE',
            topics: {
                create: [
                    { title: 'Introduction to Databases', totalLectures: 1, order: 1 },
                    { title: 'ER Modeling', totalLectures: 2, order: 2 },
                    { title: 'Relational Model', totalLectures: 2, order: 3 },
                    { title: 'SQL Basics (DDL, DML)', totalLectures: 2, order: 4 },
                    { title: 'Advanced SQL (Joins, Subqueries)', totalLectures: 3, order: 5 },
                    { title: 'Normalization (1NF, 2NF, 3NF)', totalLectures: 3, order: 6 },
                    { title: 'Transactions & Concurrency', totalLectures: 2, order: 7 },
                    { title: 'Indexing & Hashing', totalLectures: 2, order: 8 },
                    { title: 'NoSQL Overview', totalLectures: 1, order: 9 },
                ]
            }
        }
    })

    console.log('Syllabus Seeding Completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
