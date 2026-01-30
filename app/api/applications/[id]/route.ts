import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStage } from '@prisma/client';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { jobId, currentStage, recruiterNotes } = body;
        const applicationId = id;

        // Get current application to store previous stage if moving
        const currentApp = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { currentStage: true }
        });

        if (!currentApp) {
            return NextResponse.json({ error: 'Aplicação não encontrada' }, { status: 404 });
        }

        const updateData: any = {};
        if (jobId) updateData.jobId = jobId;
        if (recruiterNotes !== undefined) updateData.recruiterNotes = recruiterNotes;
        if (currentStage) {
            updateData.currentStage = currentStage as ApplicationStage;
            updateData.previousStage = currentApp.currentStage;
            updateData.lastStageChange = new Date();

            // Record history
            updateData.stageHistory = {
                create: {
                    fromStage: currentApp.currentStage,
                    toStage: currentStage as ApplicationStage,
                    changedBy: 'admin',
                    notes: recruiterNotes || 'Mudança manual de etapa'
                }
            };
        }

        const application = await prisma.application.update({
            where: { id: applicationId },
            data: updateData,
            include: {
                candidate: true,
                job: true,
                stageHistory: true,
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
