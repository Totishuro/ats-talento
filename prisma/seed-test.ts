import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Criando dados de teste...')

    // Limpar dados existentes
    await prisma.application.deleteMany()
    await prisma.candidate.deleteMany()
    await prisma.job.deleteMany()

    // Criar 5 vagas
    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                title: 'Desenvolvedor Full Stack Sênior',
                department: 'Tecnologia',
                companyName: 'Tech Solutions Brasil',
                description: 'Buscamos desenvolvedor experiente para liderar projetos de alta complexidade.',
                requirements: 'React, Node.js, TypeScript, PostgreSQL, 5+ anos de experiência',
                city: 'São Paulo',
                state: 'SP',
                workMode: 'HIBRIDO',
                salaryRange: 'R$ 12.000 - R$ 18.000',
                salaryBudget: 'R$ 20.000 (máximo)',
                status: 'OPEN',
            },
        }),
        prisma.job.create({
            data: {
                title: 'Designer UX/UI Pleno',
                department: 'Design',
                companyName: 'Startup Inovadora',
                description: 'Criar experiências incríveis para nossos usuários.',
                requirements: 'Figma, Adobe XD, Design Systems, Portfolio necessário',
                city: 'Remoto',
                state: 'REMOTO',
                workMode: 'REMOTO',
                salaryRange: 'R$ 7.000 - R$ 10.000',
                salaryBudget: 'R$ 11.000',
                status: 'OPEN',
            },
        }),
        prisma.job.create({
            data: {
                title: 'Analista de Dados',
                department: 'Business Intelligence',
                companyName: 'Corporação Analytics',
                description: 'Transformar dados em insights estratégicos para o negócio.',
                requirements: 'Python, SQL, Power BI, Excel avançado',
                city: 'Rio de Janeiro',
                state: 'RJ',
                workMode: 'PRESENCIAL',
                salaryRange: 'R$ 6.000 - R$ 9.000',
                salaryBudget: 'R$ 10.000',
                status: 'OPEN',
            },
        }),
        prisma.job.create({
            data: {
                title: 'Gerente de Projetos',
                department: 'PMO',
                companyName: 'Consultoria Empresarial',
                description: 'Liderar projetos estratégicos de transformação digital.',
                requirements: 'PMP, Scrum Master, 7+ anos de experiência',
                city: 'Belo Horizonte',
                state: 'MG',
                workMode: 'HIBRIDO',
                salaryRange: 'R$ 15.000 - R$ 22.000',
                salaryBudget: 'R$ 25.000',
                status: 'OPEN',
            },
        }),
        prisma.job.create({
            data: {
                title: 'Desenvolvedor Mobile React Native',
                department: 'Tecnologia Mobile',
                companyName: 'App Company',
                description: 'Criar aplicativos móveis revolucionários.',
                requirements: 'React Native, JavaScript/TypeScript, APIs REST',
                city: 'Remoto',
                state: 'REMOTO',
                workMode: 'REMOTO',
                salaryRange: 'R$ 8.000 - R$ 12.000',
                salaryBudget: 'R$ 13.500',
                status: 'OPEN',
            },
        }),
    ])

    console.log(`✅ ${jobs.length} vagas criadas!`)

    // Criar 5 candidatos
    const candidates = await Promise.all([
        prisma.candidate.create({
            data: {
                fullName: 'Maria Silva Santos',
                cpf: '123.456.789-01',
                email: 'maria.silva@email.com',
                phone: '(11) 98765-4321',
                city: 'São Paulo',
                state: 'SP',
                linkedinUrl: 'https://linkedin.com/in/mariasilva',
                portfolioUrl: 'https://github.com/mariasilva',
            },
        }),
        prisma.candidate.create({
            data: {
                fullName: 'João Pedro Oliveira',
                cpf: '234.567.890-12',
                email: 'joao.pedro@email.com',
                phone: '(21) 99876-5432',
                city: 'Rio de Janeiro',
                state: 'RJ',
                linkedinUrl: 'https://linkedin.com/in/joaopedro',
                portfolioUrl: 'https://dribbble.com/joaopedro',
            },
        }),
        prisma.candidate.create({
            data: {
                fullName: 'Ana Carolina Ferreira',
                cpf: '345.678.901-23',
                email: 'ana.ferreira@email.com',
                phone: '(31) 97654-3210',
                city: 'Belo Horizonte',
                state: 'MG',
                linkedinUrl: 'https://linkedin.com/in/anaferreira',
                portfolioUrl: null,
            },
        }),
        prisma.candidate.create({
            data: {
                fullName: 'Carlos Eduardo Lima',
                cpf: '456.789.012-34',
                email: 'carlos.lima@email.com',
                phone: '(11) 96543-2109',
                city: 'Campinas',
                state: 'SP',
                linkedinUrl: 'https://linkedin.com/in/carloslima',
                portfolioUrl: 'https://github.com/carloslima',
            },
        }),
        prisma.candidate.create({
            data: {
                fullName: 'Juliana Costa Rodrigues',
                cpf: '567.890.123-45',
                email: 'juliana.costa@email.com',
                phone: '(21) 95432-1098',
                city: 'Niterói',
                state: 'RJ',
                linkedinUrl: 'https://linkedin.com/in/julianacosta',
                portfolioUrl: 'https://behance.net/julianacosta',
            },
        }),
    ])

    console.log(`✅ ${candidates.length} candidatos criados!`)

    // Criar candidaturas (applications)
    const applications = await Promise.all([
        // Maria se candidatou para Desenvolvedor Full Stack (stage: Triagem)
        prisma.application.create({
            data: {
                candidateId: candidates[0].id,
                jobId: jobs[0].id,
                currentStage: 'SCREENING',
            },
        }),
        // João se candidatou para Designer UX/UI (stage: Entrevista RH)
        prisma.application.create({
            data: {
                candidateId: candidates[1].id,
                jobId: jobs[1].id,
                currentStage: 'HR_INTERVIEW',
            },
        }),
        // Ana se candidatou para Analista de Dados (stage: Aplicado)
        prisma.application.create({
            data: {
                candidateId: candidates[2].id,
                jobId: jobs[2].id,
                currentStage: 'APPLIED',
            },
        }),
        // Carlos se candidatou para Mobile (stage: Entrevista Técnica)
        prisma.application.create({
            data: {
                candidateId: candidates[3].id,
                jobId: jobs[4].id,
                currentStage: 'TECHNICAL_INTERVIEW',
            },
        }),
        // Juliana se candidatou para Designer (stage: Proposta Enviada)
        prisma.application.create({
            data: {
                candidateId: candidates[4].id,
                jobId: jobs[1].id,
                currentStage: 'PROPOSAL_SENT',
            },
        }),
        // Maria também se candidatou para Mobile (Aplicado)
        prisma.application.create({
            data: {
                candidateId: candidates[0].id,
                jobId: jobs[4].id,
                currentStage: 'APPLIED',
            },
        }),
        // Carlos se candidatou para Full Stack (Triagem)
        prisma.application.create({
            data: {
                candidateId: candidates[3].id,
                jobId: jobs[0].id,
                currentStage: 'SCREENING',
            },
        }),
    ])

    console.log(`✅ ${applications.length} candidaturas criadas!`)
    console.log('\n🎉 Banco de dados populado com sucesso!')
    console.log('\n📊 Resumo:')
    console.log(`   • ${jobs.length} vagas abertas`)
    console.log(`   • ${candidates.length} candidatos cadastrados`)
    console.log(`   • ${applications.length} candidaturas ativas`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Erro ao popular banco:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
