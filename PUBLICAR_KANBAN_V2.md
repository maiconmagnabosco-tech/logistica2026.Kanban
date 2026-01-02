# 🚀 Publicar Kanban-v2 (Versão Atualizada) no Vercel

Este guia explica como publicar a pasta **kanban-v2** (versão atualizada) no Vercel.

---

## 📋 Situação Atual

- ✅ **Pasta kanban-v2**: Versão atualizada e correta
- ⚠️ **Pasta kanban**: Versão antiga (ignorar)
- ✅ Git inicializado em kanban-v2
- ⚠️ Remote não configurado
- ⚠️ Muitas alterações não commitadas

---

## 🎯 Opção 1: Usar o Mesmo Repositório GitHub

Se quiser sobrescrever a versão antiga no GitHub:

### Passo 1: Conectar ao Repositório Existente

```bash
cd "c:\Users\maicon John\kanban-v2"

# Adicionar remote do repositório existente
git remote add origin https://github.com/maiconmagnabosco-tech/Kanban-logistica.git

# Verificar
git remote -v
```

### Passo 2: Commit e Push (sobrescreverá a versão antiga)

```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Substituir pela versão atualizada kanban-v2"

# Push forçado (ATENÇÃO: isso substitui a versão antiga)
git push -f origin main
```

### Passo 3: Deploy no Vercel

1. Acesse: https://vercel.com/dashboard
2. Encontre seu projeto
3. Ele deve fazer deploy automático
4. Ou faça Redeploy manual

---

## 🎯 Opção 2: Criar Novo Repositório (Recomendado)

Se quiser manter as duas versões separadas:

### Passo 1: Criar Novo Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `Kanban-logistica-v2` (ou outro nome)
3. **NÃO** marque "Add README"
4. Clique em **Create repository**

### Passo 2: Conectar e Fazer Push

```bash
cd "c:\Users\maicon John\kanban-v2"

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/Kanban-logistica-v2.git

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Versão atualizada kanban-v2 - Deploy inicial"

# Push
git branch -M main
git push -u origin main
```

### Passo 3: Deploy no Vercel

1. Acesse: https://vercel.com/new
2. **Import** o novo repositório
3. Configure e faça deploy

---

## ✅ Checklist

- [ ] Escolher opção (mesmo repo ou novo repo)
- [ ] Configurar remote do Git
- [ ] Fazer commit de todas as alterações
- [ ] Fazer push para GitHub
- [ ] Fazer deploy no Vercel
- [ ] Configurar Environment Variables (se necessário)
- [ ] Testar o site online

---

## 🔐 Configurações Necessárias

Se o projeto usa Google Sheets API, configure as variáveis de ambiente no Vercel:

1. **Settings** → **Environment Variables**
2. Adicione:
   - `SPREADSHEET_ID`
   - `API_KEY`
   - `WRITE_PROXY_URL` (se usar)

---

## 📝 Nota Importante

A pasta **kanban-v2** é a versão **atualizada e correta**.

A pasta **kanban** é a versão **antiga** e pode ser ignorada.

---

## 🆘 Dúvidas?

- Qual opção escolher?
  - **Opção 1**: Se quiser substituir a versão antiga
  - **Opção 2**: Se quiser manter as duas versões separadas


