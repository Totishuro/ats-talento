import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { jobId } = await request.json();
        const applicationId = params.id;

        if (!jobId) {
            return NextResponse.json(
                { error: 'jobId é obrigatório' },
                { status: 400 }
            );
        }

        // Update the application's job
        const application = await prisma.application.update({
            where: { id: applicationId },
            data: {
                jobId: jobId,
            },
            include: {
                candidate: true,
                job: true,
            },
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error('Error updating application job:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar vaga da aplicação' },
            { status: 500 }
        );
    }
}
