import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { ApplicationStage } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || '127.0.0.1';

        const birthDateStr = formData.get('birthDate') as string | null;
        const birthDate = birthDateStr ? new Date(birthDateStr) : null;

        const data = {
            fullName: formData.get('fullName') as string,
            cpf: formData.get('cpf') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            birthDate: birthDate,
            cep: formData.get('cep') as string | null,
            address: formData.get('address') as string | null,
            neighborhood: formData.get('neighborhood') as string | null,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            aboutMe: formData.get('aboutMe') as string | null,
            currentSalary: formData.get('currentSalary') ? Number(formData.get('currentSalary')) : null,
            expectedSalary: formData.get('expectedSalary') ? Number(formData.get('expectedSalary')) : null,
            employmentStatus: formData.get('employmentStatus') as string | null,
            startAvailability: formData.get('startAvailability') as string | null,
            scheduleAvailability: formData.get('scheduleAvailability') as string | null,
            bestInterviewTime: formData.get('bestInterviewTime') as string | null,
            technicalSkills: formData.getAll('technicalSkills') as string[],
            driverLicense: formData.getAll('driverLicense') as string[],
            linkedinUrl: formData.get('linkedinUrl') as string | null,
            portfolioUrl: formData.get('portfolioUrl') as string | null,
            jobId: formData.get('jobId') as string | null,
            consentDate: new Date(),
            consentIp: ip,
        };

        const resumeFile = formData.get('resumeFile') as File | null;
        const forceUpdate = formData.get('forceUpdate') === 'true';

        // Check if candidate exists for safety (if not forced)
        if (!forceUpdate) {
            const existing = await prisma.candidate.findUnique({ where: { cpf: data.cpf.replace(/\D/g, '') } });
            if (existing) {
                return NextResponse.json({ error: 'Candidate already exists', code: 'DUPLICATE_CPF' }, { status: 409 });
            }
        }

        let resumeBuffer: Buffer | null = null;
        let resumeType: string | null = null;
        let resumeFileUrl = null;

        if (resumeFile) {
            const bytes = await resumeFile.arrayBuffer();
            resumeBuffer = Buffer.from(bytes);
            resumeType = resumeFile.type;

            // Log with new naming convention (simulated for storage reference)
            const extension = resumeFile.name.split('.').pop();
            const newName = `${data.fullName.replace(/\s+/g, '_')}.${extension}`;
            resumeFileUrl = `stored_${newName}`;

            console.log(`📎 Resume file processed: ${newName} (${resumeFile.size} bytes, ${resumeType})`);
        }

        // Garantir que existe uma vaga se o jobId for fornecido
        let jobId = data.jobId;
        if (jobId && jobId !== 'default-job-id' && jobId !== '') {
            const job = await prisma.job.findUnique({
                where: { id: jobId },
            });
            if (!job) {
                // If job not found, we might want to put in "Banco de Talentos" (null jobId)
                jobId = null;
            }
        } else {
            jobId = null; // Banco de Talentos
        }

        // Use upsert or find/create to prevent duplicate candidates by CPF/Email
        // But the user request implies Applications can be multiple for same candidate.
        // So we either find the existing candidate or create a new one.

        const candidateCpf = data.cpf.replace(/\D/g, '');

        const candidate = await prisma.candidate.upsert({
            where: { cpf: candidateCpf },
            update: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                cep: data.cep,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                address: data.address,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                aboutMe: data.aboutMe,
                currentSalary: data.currentSalary ? Number(data.currentSalary) : null,
                expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null,
                employmentStatus: data.employmentStatus,
                startAvailability: data.startAvailability,
                scheduleAvailability: data.scheduleAvailability,
                bestInterviewTime: data.bestInterviewTime,
                technicalSkills: data.technicalSkills,
                driverLicense: data.driverLicense,
                linkedinUrl: data.linkedinUrl || null,
                portfolioUrl: data.portfolioUrl || null,
                resumeFileUrl: resumeFileUrl || undefined,
                resumeData: resumeBuffer || undefined,
                resumeContentType: resumeType || undefined,
                consentDate: data.consentDate ? new Date(data.consentDate) : null,
                consentIp: data.consentIp,
            } as any,
            create: {
                fullName: data.fullName,
                cpf: candidateCpf,
                email: data.email,
                phone: data.phone,
                cep: data.cep,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                address: data.address,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                aboutMe: data.aboutMe,
                currentSalary: data.currentSalary ? Number(data.currentSalary) : null,
                expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null,
                employmentStatus: data.employmentStatus,
                startAvailability: data.startAvailability,
                scheduleAvailability: data.scheduleAvailability,
                bestInterviewTime: data.bestInterviewTime,
                technicalSkills: data.technicalSkills,
                driverLicense: data.driverLicense,
                linkedinUrl: data.linkedinUrl || null,
                portfolioUrl: data.portfolioUrl || null,
                resumeFileUrl: resumeFileUrl,
                resumeData: resumeBuffer,
                resumeContentType: resumeType,
                consentDate: data.consentDate ? new Date(data.consentDate) : null,
                consentIp: data.consentIp,
            } as any,
        });

        // Create application
        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: jobId || undefined,
                currentStage: 'TRIAGEM',
                recruiterNotes: forceUpdate ? '⚠️ Atualização forçada pelo candidato (Duplicidade Validada via Desafio de Segurança).' : undefined
            } as any,
        });

        return NextResponse.json({ candidate, application }, { status: 201 });
    } catch (error: any) {
        console.error('Erro detalhado:', error);

        return NextResponse.json(
            { error: `Erro ao processar candidatura: ${error.message}` },
            { status: 500 }
        );
    }
}

