import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const candidateId = id;

        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            select: {
                fullName: true,
                resumeData: true,
                resumeContentType: true,
            },
        });

        if (!candidate || !candidate.resumeData) {
            return new NextResponse('Currículo não encontrado', { status: 404 });
        }

        // Determine extension based on content type if possible, or default to pdf
        let extension = 'pdf';
        if (candidate.resumeContentType?.includes('word')) extension = 'docx';

        const fileName = `${candidate.fullName.replace(/\s+/g, '_')}_Curriculo.${extension}`;

        return new NextResponse(candidate.resumeData as any, {
            headers: {
                'Content-Type': candidate.resumeContentType || 'application/pdf',
                'Content-Disposition': `inline; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error('Error serving resume:', error);
        return new NextResponse('Erro interno ao buscar currículo', { status: 500 });
    }
}
