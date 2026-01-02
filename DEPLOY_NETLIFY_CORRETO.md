# 🚀 Deploy Correto no Netlify - Passo a Passo

## ⚠️ PROBLEMA: Atualizações não Aparecem

O Netlify está usando **CACHE** dos arquivos antigos. Siga estes passos:

## ✅ SOLUÇÃO RÁPIDA (3 Passos)

### Passo 1: Limpar Cache no Netlify

1. **Acesse:** https://app.netlify.com
2. **Clique no seu site** (kanbanlogistica.netlify.app)
3. **Vá em "Deploys"** (no menu superior)
4. **Clique nos 3 pontinhos** (⋯) no deploy mais recente
5. **Selecione:** "Clear cache and retry deploy" (Limpar cache e fazer deploy novamente)

### Passo 2: Fazer Novo Deploy

**Opção A: Via Netlify Drop (Drag & Drop)**
1. **Selecione TODOS os arquivos** da pasta do projeto
2. **Arraste para:** https://app.netlify.com/drop
3. **Aguarde o deploy terminar**

**Opção B: Via Netlify CLI (Recomendado)**
```bash
# No terminal, na pasta do projeto:
netlify deploy --prod --dir=. --build
```

### Passo 3: Hard Refresh no Navegador

Depois do deploy terminar:
- **Windows/Linux:** Pressione `Ctrl + Shift + R` (ou `Ctrl + F5`)
- **Mac:** Pressione `Cmd + Shift + R`

Isso força o navegador a buscar arquivos novos.

## 🔧 CONFIGURAÇÃO PERMANENTE

Criei o arquivo `netlify.toml` que:
- ✅ Desabilita cache de arquivos JS, CSS e HTML
- ✅ Força o navegador a sempre buscar versões atualizadas

**Este arquivo já foi criado!** Agora, sempre que fizer deploy, ele será usado automaticamente.

## 🐛 ERRO DE CORS (Também Precisa Resolver)

Vejo na imagem que há um erro de CORS. Para resolver:

### Google Apps Script - Configurar Acesso Público

1. **Acesse:** https://script.google.com
2. **Abra seu projeto**
3. **Clique em "Publicar"** → **"Implantar como aplicativo da web"**
4. **Configure:**
   - Versão: "Nova"
   - Executar como: "Eu (seu email)"
   - **Quem tem acesso:** **"Qualquer pessoa, mesmo anônimo"** ← **MUITO IMPORTANTE!**
5. **Clique em "Implantar"**
6. **Copie a URL** (se for diferente da atual)

### Verificar URL da API

A URL atual está configurada como:
```
https://script.google.com/macros/s/AKfycbxssBm_rNlTIAVvVuwTb8kEtrqvvQcL3FKe-Z637Ko/exec
```

Se você criou um novo deploy do Google Apps Script, pode ter uma URL diferente. Verifique nos arquivos:
- `main.js` (linha 2)
- `schedule.js` (linha 2)
- `dashboard.js` (linha 2-4)

## ✅ CHECKLIST COMPLETO

- [ ] Limpou cache no Netlify (Passo 1)
- [ ] Fez novo deploy (Passo 2)
- [ ] Fez hard refresh no navegador (`Ctrl + Shift + R`)
- [ ] Configurou Google Apps Script como "Qualquer pessoa, mesmo anônimo"
- [ ] Verificou se a URL da API está correta
- [ ] Testou em navegador anônimo para confirmar

## 🎯 Ordem Recomendada

1. **Primeiro:** Configure o Google Apps Script (resolve CORS)
2. **Depois:** Limpe cache e faça novo deploy no Netlify
3. **Por último:** Faça hard refresh no navegador

## 💡 Dica Pro

Para evitar problemas de cache no futuro:
- Sempre use `netlify.toml` (já criado)
- Sempre faça "Clear cache" antes de deploy importante
- Use versão no nome dos arquivos JS (ex: `main.v2.js`) se necessário







