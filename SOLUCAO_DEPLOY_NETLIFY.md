# 🚀 Solução: Atualizações não Aparecem no Netlify

## ⚠️ Problema: Deploy não Atualiza

### Solução 1: Limpar Cache do Netlify (IMPORTANTE!)

O Netlify pode estar usando cache antigo. Faça o seguinte:

#### Opção A: Limpar Cache no Netlify Dashboard
1. **Acesse o Netlify Dashboard** (app.netlify.com)
2. **Vá no seu site**
3. **Clique em "Site settings"** (configurações do site)
4. **Vá em "Build & deploy"** → **"Post processing"**
5. **Desmarque "Asset optimization"** temporariamente (ou limpe o cache)
6. **Vá em "Deploys"**
7. **Clique nos três pontos** no deploy mais recente
8. **Selecione "Clear cache and retry deploy"** (Limpar cache e fazer deploy novamente)

#### Opção B: Forçar Novo Deploy
1. **No Netlify Dashboard**, vá em **"Deploys"**
2. **Clique em "Trigger deploy"** → **"Clear cache and deploy site"**
3. Isso vai forçar um novo deploy sem usar cache

### Solução 2: Verificar se os Arquivos Foram Salvos

1. **Verifique se você salvou todos os arquivos** antes do deploy:
   - `main.js`
   - `schedule.js`
   - `dashboard.js`

2. **Verifique o tamanho dos arquivos** no Netlify:
   - No Netlify Dashboard → "Deploys" → Clique no deploy mais recente
   - Veja os arquivos que foram enviados
   - Compare com os arquivos locais

### Solução 3: Usar Netlify CLI (Mais Confiável)

Se você está fazendo drag & drop, tente usar a CLI:

```bash
# Instalar Netlify CLI (se não tiver)
npm install -g netlify-cli

# Fazer login
netlify login

# Fazer deploy da pasta atual (sem cache)
netlify deploy --prod --dir=. --build

# Ou se já tem site configurado:
netlify deploy --prod
```

### Solução 4: Verificar Headers de Cache

Crie um arquivo `netlify.toml` na raiz do projeto:

```toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### Solução 5: Hard Refresh no Navegador

Depois do deploy, no navegador:
- **Windows/Linux:** `Ctrl + Shift + R` ou `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

Isso força o navegador a baixar arquivos novos, ignorando cache.

## 🔧 Erro de CORS (Também Visível)

Além do problema de deploy, há um erro de CORS. Para resolver:

1. **No Google Apps Script**, publique como Web App com:
   - **"Quem tem acesso: Qualquer pessoa, mesmo anônimo"**

2. **Verifique a URL da API** nos arquivos:
   - Deve ser: `https://script.google.com/macros/s/AKfycbxssBm_rNlTIAVvVuwTb8kEtrqvvQcL3FKe-Z637Ko/exec`

## ✅ Checklist Rápido

- [ ] Limpou cache no Netlify
- [ ] Salvou todos os arquivos antes do deploy
- [ ] Fez hard refresh no navegador (`Ctrl + Shift + R`)
- [ ] Verificou se os arquivos estão no deploy mais recente
- [ ] Configurou Google Apps Script como público (para CORS)

## 🎯 Método Recomendado

1. **Limpe o cache no Netlify** (Solução 1, Opção B)
2. **Faça um novo deploy**
3. **Espere 1-2 minutos** para propagação
4. **Faça hard refresh no navegador** (`Ctrl + Shift + R`)
5. **Teste novamente**







