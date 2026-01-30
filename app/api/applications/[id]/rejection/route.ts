import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStage } from '@prisma/client';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { rejectionReason, emailContent, scheduledFor } = await request.json();

        // 1. Get application data for validation
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                candidate: true,
                job: true
            }
        });

        if (!application) {
            return NextResponse.json({ error: 'Aplicação não encontrada' }, { status: 404 });
        }

        // 2. Perform Anti-Gafe Validations (Checklist)
        const validations = {
            candidateNameMatch: emailContent.includes(application.candidate.fullName.split(' ')[0]),
            jobTitleMatch: emailContent.includes(application.job?.title || ''),
            emailActive: !!application.candidate.email,
        };

        if (!validations.candidateNameMatch || !validations.jobTitleMatch) {
            return NextResponse.json({
                error: 'Falha nas validações de segurança (Anti-Gafe)',
                validations
            }, { status: 400 });
        }

        // 3. Update Application Status
        const updatedApp = await prisma.application.update({
            where: { id },
            data: {
                currentStage: 'REPROVADO' as any,
                previousStage: application.currentStage,
                lastStageChange: new Date(),
                rejectionReason,
                stageHistory: {
                    create: {
                        fromStage: application.currentStage,
                        toStage: 'REPROVADO' as any,
                        changedBy: 'recruiter', // Placeholder for actual auth user
                        notes: `Reprovado: ${rejectionReason}`
                    }
                }
            }
        });

        // 4. Update Candidate Notes
        await prisma.note.create({
            data: {
                candidateId: application.candidateId,
                applicationId: application.id,
                content: `Candidato reprovado na vaga ${application.job?.title || 'N/A'}. Razão: ${rejectionReason}`,
                createdBy: 'system'
            }
        });

        // 5. Simulate Email Sending (In a real app, integrate with SendGrid/AWS SES)
        console.log(`Email rejected to ${application.candidate.email} scheduled for ${scheduledFor || 'now'}`);

        return NextResponse.json({
            success: true,
            message: scheduledFor ? 'Reprovação agendada com sucesso' : 'Candidato reprovado e email enviado',
            application: updatedApp
        });

    } catch (error) {
        console.error('Error in rejection flow:', error);
        return NextResponse.json({ error: 'Erro interno ao processar reprovação' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                candidate: true,
                job: true
            }
        });

        if (!application) {
            return NextResponse.json({ error: 'Aplicação não encontrada' }, { status: 404 });
        }

        // Generate dynamic template preview
        const firstName = application.candidate.fullName.split(' ')[0];
        const jobTitle = application.job?.title || 'Vaga';

        const preview = `Olá, ${firstName}!

Agradecemos seu interesse na vaga de ${jobTitle} na Talento.

Após análise cuidadosa do seu perfil, decidimos seguir com outros candidatos que possuem maior aderência aos requisitos técnicos exigidos para esta posição específica no momento.

Seu currículo permanecerá em nosso banco de talentos para futuras oportunidades.

Atenciosamente,
Equipe de Recrutamento Talento`;

        return NextResponse.json({
            preview,
            validations: {
                name: firstName,
                job: jobTitle,
                email: application.candidate.email
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar preview de email' }, { status: 500 });
    }
}
