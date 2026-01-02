# ✅ Checklist - Deploy para Netlify

## 📋 Arquivos Atualizados e Salvos Localmente

### ✅ Arquivos HTML (com versão para evitar cache)
- [x] `index.html` - Atualizado com `?v=20250128` em todos os JS/CSS
- [x] `dashboard.html` - Atualizado com `?v=20250128` em todos os JS/CSS
- [x] `schedule.html` - Atualizado com `?v=20250128` em todos os JS/CSS
- [x] `login.html` - OK

### ✅ Arquivos JavaScript (com nova URL da API)
- [x] `main.js` - URL da API atualizada: `AKfycbxssBm_rNlTIAVvVuwTb8kEtrqvvQcL3FKe-Z637Ko`
- [x] `schedule.js` - URL da API atualizada
- [x] `dashboard.js` - URL da API atualizada
- [x] `auth-config.js` - OK

### ✅ Arquivos de Configuração
- [x] `netlify.toml` - Criado para evitar cache
- [x] `style.css` - OK
- [x] `CODIGO_COMPLETO_GOOGLE_SCRIPT_ATUALIZADO.js` - Código do Google Apps Script atualizado

## 🚀 Passos para Deploy

### Opção 1: Netlify Drop (Mais Rápido)
1. **Abra:** https://app.netlify.com/drop
2. **Selecione TODOS os arquivos** da pasta do projeto
3. **Arraste para a área de drop**
4. **Aguarde o deploy terminar**
5. **Teste o site**

### Opção 2: Via Netlify CLI
```bash
# Instalar Netlify CLI (se não tiver)
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=.
```

## ✅ O que foi Atualizado

1. **URL da API do Google Apps Script:**
   - Nova URL: `AKfycbxssBm_rNlTIAVvVuwTb8kEtrqvvQcL3FKe-Z637Ko`
   - Atualizada em: `main.js`, `schedule.js`, `dashboard.js`

2. **Cache Busting:**
   - Todos os arquivos JS/CSS agora têm `?v=20250128`
   - Isso força o navegador a buscar versões novas

3. **Configuração Netlify:**
   - Arquivo `netlify.toml` criado para desabilitar cache

## 📝 Nota Importante

**Todos os arquivos estão salvos localmente e prontos para deploy!**

Você pode fazer o deploy agora. Os arquivos incluem:
- ✅ Nova URL da API
- ✅ Parâmetros de versão para evitar cache
- ✅ Configuração do Netlify
- ✅ Todas as atualizações do código







