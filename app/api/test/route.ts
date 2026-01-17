import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Test if DATABASE_URL is accessible
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            return NextResponse.json({
                error: 'DATABASE_URL not found',
                env: Object.keys(process.env).filter(k => k.includes('DATABASE'))
            }, { status: 500 });
        }

        // Test if we can import Prisma
        try {
            const { prisma } = await import('@/lib/prisma');

            // Test connection
            await prisma.$queryRaw`SELECT 1 as test`;

            return NextResponse.json({
                status: 'OK',
                message: 'Database connection successful',
                hasUrl: !!databaseUrl,
                urlPrefix: databaseUrl.substring(0, 20) + '...'
            });
        } catch (prismaError) {
            return NextResponse.json({
                error: 'Prisma error',
                message: prismaError instanceof Error ? prismaError.message : 'Unknown',
                stack: prismaError instanceof Error ? prismaError.stack : undefined
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({
            error: 'General error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
