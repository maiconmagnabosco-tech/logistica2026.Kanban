# 🚀 Guia Completo - Deploy com GitHub + Vercel

## 📋 Pré-requisitos

- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Vercel (gratuita)
- ✅ Git instalado no computador (ou use GitHub Desktop)

---

## 📦 Passo 1: Preparar o Projeto

### 1.1 Verificar Arquivos

Certifique-se de que todos os arquivos estão na pasta:
```
C:\Users\maicon John\Logistica 2026\
```

### 1.2 Verificar .gitignore

O arquivo `.gitignore` já existe e está configurado para ignorar arquivos desnecessários.

---

## 🐙 Passo 2: Criar Repositório no GitHub

### 2.1 Criar Novo Repositório

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name:** `kanban-logistica-magnabosco` (ou outro nome)
   - **Description:** `Sistema Kanban Logística MAGNABOSCO`
   - **Visibility:** 
     - ✅ **Public** (recomendado - gratuito)
     - ⚠️ **Private** (se quiser privado)
3. **NÃO marque** "Add a README file" (já temos arquivos)
4. **NÃO marque** "Add .gitignore" (já temos)
5. Clique em **"Create repository"**

### 2.2 Copiar URL do Repositório

Após criar, você verá uma página com instruções. **Copie a URL** do repositório:
```
https://github.com/SEU_USUARIO/kanban-logistica-magnabosco.git
```

---

## 💻 Passo 3: Configurar Git Local

### Opção A: Usando Git no Terminal (Recomendado)

#### 3.1 Abrir Terminal na Pasta do Projeto

1. Abra o **PowerShell** ou **Prompt de Comando**
2. Navegue até a pasta:
```powershell
cd "C:\Users\maicon John\Logistica 2026"
```

#### 3.2 Inicializar Git (se ainda não foi feito)

```bash
git init
```

#### 3.3 Adicionar Todos os Arquivos

```bash
git add .
```

#### 3.4 Fazer Primeiro Commit

```bash
git commit -m "Versão inicial - Sistema Kanban Logística MAGNABOSCO"
```

#### 3.5 Conectar ao Repositório GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/kanban-logistica-magnabosco.git
```

**Substitua `SEU_USUARIO` pelo seu usuário do GitHub!**

#### 3.6 Renomear Branch para main

```bash
git branch -M main
```

#### 3.7 Enviar para GitHub

```bash
git push -u origin main
```

**Nota:** Se pedir login, use suas credenciais do GitHub ou um token de acesso pessoal.

---

### Opção B: Usando GitHub Desktop (Mais Fácil)

#### 3.1 Instalar GitHub Desktop

1. Baixe: **https://desktop.github.com/**
2. Instale e faça login com sua conta GitHub

#### 3.2 Adicionar Repositório Local

1. Abra GitHub Desktop
2. Clique em **"File"** → **"Add Local Repository"**
3. Clique em **"Choose..."**
4. Selecione a pasta: `C:\Users\maicon John\Logistica 2026`
5. Clique em **"Add repository"**

#### 3.3 Fazer Commit

1. No GitHub Desktop, você verá todos os arquivos
2. Escreva uma mensagem: `Versão inicial - Sistema Kanban Logística MAGNABOSCO`
3. Clique em **"Commit to main"**

#### 3.4 Publicar no GitHub

1. Clique em **"Publish repository"**
2. Marque **"Keep this code private"** se quiser privado
3. Clique em **"Publish repository"**

---

## 🌐 Passo 4: Conectar ao Vercel

### 4.1 Acessar Vercel

1. Acesse: **https://vercel.com**
2. Faça login (pode usar GitHub - mais fácil)
3. Clique em **"Add New..."** → **"Project"**

### 4.2 Importar Repositório

1. Você verá seus repositórios do GitHub
2. Encontre: `kanban-logistica-magnabosco` (ou o nome que você escolheu)
3. Clique em **"Import"**

### 4.3 Configurar Projeto

1. **Project Name:** `kanban-logistica-magnabosco` (ou deixe padrão)
2. **Framework Preset:** 
   - Selecione **"Other"** ou **"Vite"** (não importa muito)
3. **Root Directory:** 
   - Deixe vazio (`.`) ou `/` se todos os arquivos estão na raiz
4. **Build Command:** 
   - Deixe vazio (não precisa build)
5. **Output Directory:** 
   - Deixe vazio (`.`) ou `/`
6. **Install Command:** 
   - Deixe vazio (não precisa instalar nada)

### 4.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos
3. **Pronto!** ✅

---

## ✅ Passo 5: Verificar Deploy

### 5.1 Acessar Site

1. Após o deploy, você verá uma URL como:
   ```
   https://kanban-logistica-magnabosco.vercel.app
   ```
2. Clique na URL ou copie e cole no navegador
3. Deve abrir a tela de login

### 5.2 Testar Funcionalidades

- [ ] Login funciona
- [ ] Kanban carrega
- [ ] Criar tarefa funciona
- [ ] Dashboard funciona
- [ ] Cronograma funciona
- [ ] Salvar plantão funciona

---

## 🔄 Passo 6: Atualizações Futuras

### Quando Fizer Alterações

#### Usando Terminal:

```bash
# 1. Ir para a pasta
cd "C:\Users\maicon John\Logistica 2026"

# 2. Adicionar mudanças
git add .

# 3. Fazer commit
git commit -m "Descrição das mudanças"

# 4. Enviar para GitHub
git push
```

**O Vercel atualiza automaticamente!** (pode levar 1-2 minutos)

#### Usando GitHub Desktop:

1. Faça suas alterações nos arquivos
2. Abra GitHub Desktop
3. Escreva mensagem do commit
4. Clique em **"Commit to main"**
5. Clique em **"Push origin"**

**O Vercel atualiza automaticamente!**

---

## 🔧 Configurações do Vercel

### O arquivo `vercel.json` já está configurado!

Ele define:
- ✅ Rotas corretas (login.html, index.html, dashboard.html, schedule.html)
- ✅ Headers de segurança
- ✅ Redirecionamentos

**Não precisa alterar nada!**

---

## 📝 Checklist Completo

### GitHub:
- [ ] Conta criada no GitHub
- [ ] Repositório criado
- [ ] Arquivos enviados (git push)
- [ ] Repositório visível no GitHub

### Vercel:
- [ ] Conta criada no Vercel
- [ ] Repositório importado
- [ ] Deploy concluído
- [ ] Site acessível
- [ ] Todas as funcionalidades testadas

---

## 🆘 Problemas Comuns

### "Erro ao fazer push"

**Solução:**
- Verifique se está logado no Git
- Use token de acesso pessoal do GitHub
- Ou use GitHub Desktop (mais fácil)

### "Vercel não encontra os arquivos"

**Solução:**
- Verifique se `vercel.json` está na raiz
- Verifique se `index.html` ou `login.html` está na raiz
- Ajuste "Root Directory" nas configurações do Vercel

### "Site não carrega corretamente"

**Solução:**
- Verifique se todos os arquivos foram enviados
- Verifique o console do navegador (F12)
- Verifique os logs do Vercel

### "API não funciona"

**Solução:**
- Verifique se a URL da API está correta nos arquivos
- Verifique se o Google Apps Script está publicado
- Verifique o console do navegador (F12)

---

## 🎯 Resumo Rápido

1. **GitHub:**
   - Criar repositório
   - `git init`, `git add .`, `git commit`, `git push`

2. **Vercel:**
   - Importar repositório
   - Deploy automático

3. **Atualizações:**
   - `git push` → Vercel atualiza automaticamente

---

## 📞 Próximos Passos

1. ✅ Criar repositório no GitHub
2. ✅ Enviar arquivos (git push)
3. ✅ Conectar ao Vercel
4. ✅ Fazer deploy
5. ✅ Testar site online
6. ✅ Compartilhar URL com equipe

---

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** ⭐⭐ Fácil  
**Status:** ✅ Pronto para começar!





