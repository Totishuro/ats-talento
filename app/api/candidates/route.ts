import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Garantir que existe uma vaga padrão
        let job = await prisma.job.findUnique({
            where: { id: data.jobId || 'default-job-id' },
        });

        if (!job) {
            // Criar vaga padrão automaticamente
            job = await prisma.job.create({
                data: {
                    id: 'default-job-id',
                    title: 'Vaga Geral - Talento',
                    department: 'RH',
                    status: 'OPEN',
                },
            });
        }

        const candidate = await prisma.candidate.create({
            data: {
                fullName: data.fullName,
                cpf: data.cpf.replace(/\D/g, ''), // Remove formatação do CPF
                email: data.email,
                phone: data.phone,
                city: data.city,
                state: data.state,
                linkedinUrl: data.linkedinUrl || null,
                portfolioUrl: data.portfolioUrl || null,
                resumeFileUrl: data.resumeFileUrl || null,
                applications: {
                    create: {
                        jobId: job.id,
                        currentStage: 'APPLIED',
                    },
                },
            },
            include: {
                applications: true,
            },
        });

        return NextResponse.json(candidate, { status: 201 });
    } catch (error: any) {
        console.error('Erro detalhado:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'CPF ou email já cadastrado no sistema' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: `Erro ao criar candidato: ${error.message}` },
            { status: 500 }
        );
    }
}
