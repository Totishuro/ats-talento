import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET public jobs (NUNCA retorna salaryBudget)
export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                status: 'OPEN', // Apenas vagas abertas
            },
            select: {
                id: true,
                title: true,
                department: true,
                companyName: true,
                description: true,
                requirements: true,
                location: true,
                workMode: true,
                salaryRange: true, // P\u00fablico - OK exibir
                // salaryBudget: REMOVIDO - NUNCA expor para candidatos!
                status: true,
                createdAt: true,
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
        console.error('Erro ao buscar vagas p\u00fablicas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vagas' },
            { status: 500 }
        );
    }
}
