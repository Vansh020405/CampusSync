
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding Syllabus Data...')

    // 1. Create Java Subject
    await prisma.syllabusSubject.upsert({
        where: { subjectName: 'Java' },
        update: {},
        create: {
            subjectName: 'Java',
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

    // 2. Create DBMS Subject
    await prisma.syllabusSubject.upsert({
        where: { subjectName: 'DBMS' },
        update: {},
        create: {
            subjectName: 'DBMS',
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

    // 3. Create Applied Prob Subject
    await prisma.syllabusSubject.upsert({
        where: { subjectName: 'Applied Prob' },
        update: {},
        create: {
            subjectName: 'Applied Prob',
            subjectCode: 'MA201',
            department: 'MATH',
            topics: {
                create: [
                    { title: 'Basic Probability', totalLectures: 2, order: 1 },
                    { title: 'Random Variables', totalLectures: 3, order: 2 },
                    { title: 'Distributions (Normal, Binomial)', totalLectures: 4, order: 3 },
                    { title: 'Expected Value & Variance', totalLectures: 2, order: 4 },
                    { title: 'Correlation & Regression', totalLectures: 3, order: 5 },
                ]
            }
        }
    })

    console.log('Syllabus Seeding Completed with additional matches!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
