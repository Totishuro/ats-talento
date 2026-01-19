import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Whitelist fields to avoid Prisma errors with unknown fields
        const allowedFields = [
            'fullName', 'email', 'phone', 'cpf',
            'city', 'state', 'country',
            'linkedinUrl', 'portfolioUrl'
        ];

        const updateData: any = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        // Clean CPF if provided
        if (updateData.cpf) {
            updateData.cpf = updateData.cpf.replace(/\D/g, '');
        }

        const candidate = await prisma.candidate.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(candidate);
    } catch (error: any) {
        console.error('Erro ao atualizar candidato:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'CPF ou Email já cadastrado em outro perfil.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: `Erro ao atualizar candidato: ${error.message}` },
            { status: 500 }
        );
    }
}
