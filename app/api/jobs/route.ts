import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all jobs
export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vagas' },
            { status: 500 }
        );
    }
}

// POST new job
export async function POST(request: Request) {
    try {
        const data = await request.json();

        const job = await prisma.job.create({
            data: {
                title: data.title,
                department: data.department,
                companyName: data.companyName || '',
                description: data.description || '',
                requirements: data.requirements || '',
                city: data.city || '',
                state: data.state || '',
                workMode: data.workMode || 'PRESENCIAL',
                salaryRange: data.salaryRange || null,
                salaryBudget: data.salaryBudget || null, // CONFIDENCIAL
                status: data.status || 'RASCUNHO',
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar vaga:', error);
        return NextResponse.json(
            { error: 'Erro ao criar vaga' },
            { status: 500 }
        );
    }
}

// PATCH update job
export async function PATCH(request: Request) {
    try {
        const { id, ...data } = await request.json();

        const job = await prisma.job.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(job);
    } catch (error) {
        console.error('Erro ao atualizar vaga:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar vaga' },
            { status: 500 }
        );
    }
}

// DELETE job
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        await prisma.job.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar vaga:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar vaga' },
            { status: 500 }
        );
    }
}
