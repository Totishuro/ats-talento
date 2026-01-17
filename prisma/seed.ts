import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Criar vaga padrão
    const job = await prisma.job.upsert({
        where: { id: 'default-job-id' },
        update: {},
        create: {
            id: 'default-job-id',
            title: 'Vaga Geral - Talento',
            department: 'RH',
            status: 'OPEN',
        },
    });

    console.log('✅ Vaga padrão criada:', job);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
