import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        console.log('ðŸ” Testing admin login for:', username);

        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            console.log('âŒ Admin not found');
            return NextResponse.json({
                success: false,
                error: 'Admin not found'
            });
        }

        console.log('âœ… Admin found:', admin.username);

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        console.log('ðŸ” Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                error: 'Invalid password'
            });
        }

        return NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name
            }
        });

    } catch (error) {
        console.error('Test login error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
