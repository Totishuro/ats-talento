import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const applications = await prisma.application.findMany({
            include: {
                candidate: true,
                job: true,
            },
            orderBy: {
                lastStageChange: 'desc',
            },
        });

        return NextResponse.json(applications);
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao buscar aplicações' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, currentStage } = await request.json();

        const application = await prisma.application.update({
            where: { id },
            data: {
                currentStage,
                lastStageChange: new Date(),
            },
            include: {
                candidate: true,
                job: true,
            },
        });

        return NextResponse.json(application);
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao atualizar aplicação' },
            { status: 500 }
        );
    }
}
