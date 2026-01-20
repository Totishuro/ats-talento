
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cpf = searchParams.get('cpf');

        if (!cpf) {
            return NextResponse.json({ error: 'CPF required' }, { status: 400 });
        }

        const candidate = await prisma.candidate.findUnique({
            where: { cpf: cpf },
            select: { id: true, phone: true, email: true, cep: true } as any
        });

        if (candidate) {
            return NextResponse.json({
                exists: true,
                id: candidate.id,
                maskedPhone: candidate.phone, // In prod, mask this server-side
                maskedEmail: candidate.email, // In prod, mask this server-side
                cep: candidate.cep
            });
        }

        return NextResponse.json({ exists: false });

    } catch (error) {
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
