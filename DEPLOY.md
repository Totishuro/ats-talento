# 🚀 Deploy no Vercel - Guia Completo

Este guia irá ajudá-lo a fazer o deploy do **ATS Talento** no Vercel.

## ⚠️ IMPORTANTE: Banco de Dados

O projeto atualmente usa **SQLite** (arquivo local `dev.db`), que **NÃO funciona no Vercel** porque o Vercel usa um sistema de arquivos efêmero (os arquivos são deletados após cada deploy).

### Você tem 2 opções:

---

## 📌 Opção 1: PostgreSQL na Nuvem (RECOMENDADO)

Use um banco de dados PostgreSQL hospedado. Recomendações:

### **Vercel Postgres** (Mais fácil integração)
1. Acesse seu projeto no Vercel Dashboard
2. Vá em **Storage** → **Create Database** → **Postgres**
3. Copie a `DATABASE_URL` gerada
4. Cole em **Settings** → **Environment Variables**

### **Neon** (Gratuito e fácil)
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string
4. Adicione como variável de ambiente `DATABASE_URL` no Vercel

### **Supabase** (Gratuito)
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings** → **Database** → copie a connection string
4. Adicione como variável de ambiente `DATABASE_URL` no Vercel

### Configuração do Prisma para PostgreSQL

Edite `prisma/schema.prisma` e altere:

```prisma
datasource db {
  provider = "postgresql"  // Altere de "sqlite" para "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois rode:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📌 Opção 2: Vercel Blob/KV (Alternativa)

Se quiser continuar com SQLite, você pode usar **Turso** (SQLite na nuvem):

1. Crie uma conta em [turso.tech](https://turso.tech)
2. Crie um banco de dados
3. Use a connection string fornecida
4. Instale: `npm install @libsql/client`

---

## 🌐 Etapas de Deploy no Vercel

### 1. Criar Repositório no GitHub

```bash
git add .
git commit -m "Initial commit - ATS Talento"
```

Crie um repositório no GitHub e conecte:
```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git branch -M main
git push -u origin main
```

### 2. Deploy no Vercel

#### Via Dashboard (Mais fácil):
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **Add New** → **Project**
4. Selecione seu repositório
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Sua connection string do PostgreSQL
6. Clique em **Deploy**

#### Via CLI:
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Configurar Variáveis de Ambiente

No Vercel Dashboard, vá em:
- **Settings** → **Environment Variables**

Adicione:
- **Name:** `DATABASE_URL`
- **Value:** Sua connection string (PostgreSQL)

### 4. Executar Migrations no Banco de Produção

Após o primeiro deploy, rode as migrations:

```bash
# Localmente, apontando para o banco de produção
DATABASE_URL="sua-url-postgres-aqui" npx prisma migrate deploy
```

Ou use o Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

---

## ✅ Checklist de Deploy

- [ ] Escolher provedor de banco de dados (PostgreSQL recomendado)
- [ ] Atualizar `prisma/schema.prisma` para PostgreSQL
- [ ] Rodar migrations localmente
- [ ] Criar repositório no GitHub
- [ ] Fazer push do código
- [ ] Criar projeto no Vercel
- [ ] Adicionar `DATABASE_URL` nas variáveis de ambiente
- [ ] Fazer deploy
- [ ] Rodar migrations no banco de produção
- [ ] Testar a aplicação online

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção (testar localmente)
npm run build
npm start

# Prisma
npx prisma studio          # Visualizar banco de dados
npx prisma migrate dev     # Criar nova migration
npx prisma generate        # Gerar Prisma Client
```

---

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma com PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
- [Neon](https://neon.tech/docs/get-started-with-neon/signing-up)

---

**Boa sorte com o deploy! 🚀**
