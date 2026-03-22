import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const internships = await prisma.internship.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Parse comma separated strings into arrays for the frontend
        const parsedInternships = internships.map(i => ({
            ...i,
            skills: i.skills ? i.skills.split(',').map(s => s.trim()) : [],
            branchesAllowed: i.branchesAllowed ? i.branchesAllowed.split(',').map(s => s.trim()) : []
        }));

        return NextResponse.json(parsedInternships);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const internship = await prisma.internship.create({
            data: {
                company: body.company,
                role: body.role,
                stipend: body.stipend,
                location: body.location,
                mode: body.mode,
                eligibilityCgpa: parseFloat(body.eligibilityCgpa),
                branchesAllowed: Array.isArray(body.branchesAllowed) ? body.branchesAllowed.join(', ') : body.branchesAllowed,
                deadline: new Date(body.deadline),
                description: body.description,
                applyLink: body.applyLink,
                skills: Array.isArray(body.skills) ? body.skills.join(', ') : body.skills,
            }
        });
        return NextResponse.json(internship);
    } catch (error) {
        console.error('Error creating internship:', error);
        return NextResponse.json({ error: 'Failed to create internship' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.internship.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete internship' }, { status: 500 });
    }
}
