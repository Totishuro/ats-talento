# Deployment Fix

## Para resolver o problema de "unverified commit" no Vercel:

### Opção 1: Deploy Manual via CLI (RECOMENDADO)

Instale o Vercel CLI e faça deploy manual:

```powershell
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer login
vercel login

# Deploy para produção
cd c:\Users\leona\Downloads\ATSProjeto\ats-talento
vercel --prod
```

### Opção 2: Fazer pequena mudança em arquivo

Crie um arquivo `.vercelignore` vazio apenas para triggerar novo deploy:

```powershell
cd c:\Users\leona\Downloads\ATSProjeto\ats-talento
echo "# Deployment trigger" > .vercelignore
git add .vercelignore
git commit -m "chore: add vercelignore"
git push origin main
```

### Opção 3: No Dashboard do Vercel

1. Vá em: https://vercel.com/totishuros-projects/ats-talento
2. Clique na aba **"Deployments"**
3. Clique no botão **"Redeploy"** no deployment de 1d atrás (57hnU6hG)
4. Ou crie novo deployment clicando **"Deploy"** → selecione branch **main**

## Problema Atual

- ✅ Site está online: https://ats-talento.vercel.app
- ❌ Rodando versão antiga (1 dia atrás)
- ❌ LogoBranco.png retorna 404
- ❌ KPIs ainda mostram valores hardcoded

## Próximos Passos

Escolha uma das opções acima para forçar novo deployment!
