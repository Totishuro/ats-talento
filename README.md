# ATS Talento - Aplicação Funcional

## ✅ O Que Foi Criado

Uma aplicação **full-stack** completa com:

### 1. **Formulário de Candidatura** (`/candidatar`)
- Campos: Nome, CPF, Email, Telefone, Cidade, Estado
- Links opcionais: LinkedIn, Portfolio
- Validação de duplicidade (CPF único)
- Responsivo (mobile-first)
- Conexão com banco de dados SQLite

### 2. **Painel Admin com Kanban** (`/admin`)
- **Board estilo Planner** com 6 colunas:
  - Inscritos
  - Triagem
  - Entrevista RH
  - Entrevista Técnica
  - Proposta Enviada
  - Contratado
- **Drag-and-Drop**: Arraste candidatos entre fases
- Dashboard com estatísticas em tempo real
- Atualização automática no banco

### 3. **Banco de Candidatos** (tabela no `/admin`)
- Lista todos os candidatos
- Informações: Nome, Email, Telefone, Localização, Status, Data
- Ordenado por data de aplicação

## 🛠️ Tecnologias Usadas

```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS
Backend:   Next.js API Routes
Database:  SQLite + Prisma ORM
UI:        Drag-and-Drop nativo HTML5
```

##  🚀 Como Usar

### Iniciar aplicação:
```bash
cd ats-talento
npm run dev
```

**Acessar:**
- Home: http://localhost:3000
- Formulário: http://localhost:3000/candidatar
- Admin: http://localhost:3000/admin

### Ver banco de dados:
```bash
npx prisma studio
```

Abre interface visual em http://localhost:5555

## 📊 Estrutura do Banco

```
Candidate (candidatos)
├─ id, fullName, cpf, email, phone
├─ city, state, linkedinUrl, portfolioUrl
└─ applications[]

Application (candidaturas/processos)
├─ id, candidateId, jobId
├─ currentStage (APPLIED, SCREENING, etc.)
└─ appliedAt, lastStageChange

Job (vagas)
├─ id, title, department, status
└─ applications[]
```

## ✨ Funcionalidades Implementadas

✅ Formulário de candidatura funcional
✅ API para criar candidatos
✅ API para atualizar status
✅ Kanban drag-and-drop
✅ Banco de dados SQLite
✅ Visualização de todos os candidatos
✅ Dashboard com estatísticas
✅ Design responsivo
✅ Validação de CPF único

## 🔄 Próximos Passos (Não Implementados)

- [ ] Upload de currículo (arquivo)
- [ ] Sistema anti-gafe de emails
- [ ] WhatsApp integration
- [ ] Parsing de CV com IA
- [ ] Autenticação de usuários
- [ ] Múltiplas vagas

## 📁 Estrutura de Arquivos

```
ats-talento/
├── app/
│   ├── page.tsx (Home)
│   ├── candidatar/page.tsx (Formulário)
│   ├── admin/page.tsx (Kanban + Banco)
│   └── api/
│       ├── candidates/route.ts
│       └── applications/route.ts
├── lib/
│   └── prisma.ts (Database client)
├── prisma/
│   ├── schema.prisma (Schema do DB)
│   └── dev.db (SQLite database)
└── package.json
```

**Pronto para uso!** 🚀
