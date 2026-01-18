import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStage } from '@prisma/client';

export async function GET() {
    try {
        const applications = await prisma.application.findMany({
            include: {
                candidate: {
                    include: {
                        notes: true
                    }
                },
                job: true,
                stageHistory: true,
            },
            orderBy: {
                lastStageChange: 'desc',
            },
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar aplicações' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, currentStage, notes, changedBy = 'system' } = await request.json();

        // Get current application to store previous stage
        const currentApp = await prisma.application.findUnique({
            where: { id },
            select: { currentStage: true }
        });

        if (!currentApp) {
            return NextResponse.json({ error: 'Aplicação não encontrada' }, { status: 404 });
        }

        const application = await prisma.application.update({
            where: { id },
            data: {
                currentStage: currentStage as ApplicationStage,
                previousStage: currentApp.currentStage as ApplicationStage,
                lastStageChange: new Date(),
                stageHistory: {
                    create: {
                        fromStage: currentApp.currentStage as ApplicationStage,
                        toStage: currentStage as ApplicationStage,
                        changedBy,
                        notes
                    }
                }
            },
            include: {
                candidate: true,
                job: true,
            },
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar aplicação' },
            { status: 500 }
        );
    }
}
