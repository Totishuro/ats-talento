import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const candidate = await prisma.candidate.findUnique({
            where: { id },
            select: {
                resumeData: true,
                resumeContentType: true,
                fullName: true
            },
        });

        if (!candidate || !candidate.resumeData) {
            return new NextResponse('Currículo não encontrado no banco de dados.', { status: 404 });
        }

        // Determine File Extension
        let extension = 'pdf'; // Default
        const contentType = candidate.resumeContentType || 'application/pdf';

        if (contentType.includes('word')) extension = 'docx';
        else if (contentType.includes('msword')) extension = 'doc';

        const filename = `Curriculo_${candidate.fullName.replace(/\s+/g, '_')}.${extension}`;

        // Create response with file data
        return new NextResponse(candidate.resumeData as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Erro ao baixar currículo:', error);
        return NextResponse.json(
            { error: 'Erro interno ao processar download' },
            { status: 500 }
        );
    }
}
