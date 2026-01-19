import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const data = {
            fullName: formData.get('fullName') as string,
            cpf: formData.get('cpf') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            linkedinUrl: formData.get('linkedinUrl') as string | null,
            portfolioUrl: formData.get('portfolioUrl') as string | null,
            jobId: formData.get('jobId') as string,
        };

        const resumeFile = formData.get('resumeFile') as File | null;
        let resumeBuffer: Buffer | null = null;
        let resumeType: string | null = null;
        let resumeFileUrl = null;

        if (resumeFile) {
            const bytes = await resumeFile.arrayBuffer();
            resumeBuffer = Buffer.from(bytes);
            resumeType = resumeFile.type;
            // The URL will be constructed dynamically, but we can store a reference
            resumeFileUrl = 'db_stored';
            console.log(`📎 Resume file processed: ${resumeFile.name} (${resumeFile.size} bytes, ${resumeType})`);
        }

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
                country: 'Brasil', // Default
                linkedinUrl: data.linkedinUrl || null,
                portfolioUrl: data.portfolioUrl || null,
                resumeFileUrl: resumeFileUrl,
                resumeData: resumeBuffer,
                resumeContentType: resumeType,
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
