# Corrigir Root Directory no Vercel

## Problema
```
Error: The provided path "~\Downloads\ATSProjeto\ats-talento\main" does not exist.
```

O Vercel está configurado para procurar código em `/main` mas o código está na raiz.

## Solução

### Via Dashboard (MAIS FÁCIL):

1. Acesse: https://vercel.com/totishuros-projects/ats-talento/settings
2. Vá em **"Build & Development Settings"** ou **"General"**
3. Encontre **"Root Directory"**
4. Limpe o campo (deixe vazio) ou coloque `.` (ponto = raiz)
5. Clique em **"Save"**
6. Volte e execute: `vercel --prod`

### Via CLI (alternativa):

```powershell
cd c:\Users\leona\Downloads\ATSProjeto\ats-talento
vercel --prod --yes --cwd .
```

## Depois

Após corrigir, execute novamente:
```powershell
vercel --prod
```
