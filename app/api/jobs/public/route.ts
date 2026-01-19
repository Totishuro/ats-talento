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
                city: true,
                state: true,
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
        console.error('Erro ao buscar vagas públicas:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Erro ao buscar vagas', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
