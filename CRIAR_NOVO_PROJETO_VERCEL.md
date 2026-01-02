# 🆕 Criar Novo Projeto no Vercel - Passo a Passo

Guia completo para criar um novo projeto no Vercel com a versão atualizada (kanban-v2).

---

## 📋 Pré-requisitos

- ✅ Código já está no GitHub (✅ feito)
- ✅ Conta no Vercel
- ✅ Acesso ao GitHub

---

## 🚀 Passo a Passo Completo

### 1️⃣ Acessar o Vercel

1. Abra seu navegador
2. Acesse: **https://vercel.com**
3. Faça login (use sua conta GitHub se tiver)

---

### 2️⃣ Criar Novo Projeto

1. No dashboard do Vercel, clique em:
   - **"Add New..."** (botão no canto superior direito)
   - Ou **"New Project"**

---

### 3️⃣ Importar do GitHub

1. Você verá uma lista de repositórios GitHub
2. **Procure por:** `Kanban-logistica` (ou `maiconmagnabosco-tech/Kanban-logistica`)
3. **Clique em "Import"** ao lado do repositório

---

### 4️⃣ Configurar o Projeto

Na tela de configuração:

#### Project Name:
- **Nome:** `kanban-logistica-v2` (ou outro nome de sua escolha)
- Exemplo: `kanban-magnabosco` ou `kanban-logistica-producao`

#### Framework Preset:
- Selecione: **"Other"** ou **"Vite"** (se aparecer)
- Ou deixe **"No Framework"**

#### Root Directory:
- Deixe **vazio** ou `./`

#### Build and Output Settings:
- **Build Command:** Deixe **vazio**
- **Output Directory:** Deixe **vazio**
- **Install Command:** Deixe **vazio**

#### Environment Variables:
- Por enquanto, deixe vazio (configuraremos depois se necessário)

---

### 5️⃣ Deploy

1. Clique no botão **"Deploy"** (ou "Create Project")
2. Aguarde o processo (1-3 minutos)
3. Você verá o progresso em tempo real

---

### 6️⃣ Aguardar Deploy Completar

O Vercel mostrará:
- ✅ Building...
- ✅ Deploying...
- ✅ Ready!

Quando aparecer **"Ready"**, o site está online!

---

### 7️⃣ Acessar o Site

1. Clique em **"Visit"** ou **"Go to Dashboard"**
2. Você verá a URL do site (exemplo: `https://kanban-logistica-v2.vercel.app`)
3. Clique para abrir o site
4. **Teste o login:**
   - Email: `teste@transmagnabosco.com.br`
   - Senha: `123456`

---

## ✅ Verificação Final

Após o deploy:

- [ ] Site abre corretamente
- [ ] Tela de login aparece
- [ ] Login funciona com senha `123456`
- [ ] Interface carrega normalmente
- [ ] Não há erros no console (F12)

---

## 🔐 Configurações Adicionais (se necessário)

Se o projeto usar Google Sheets API, você pode precisar configurar:

1. **No Vercel:**
   - Settings → Environment Variables
   - Adicione as variáveis (se necessário)

2. **Para este projeto (kanban-v2):**
   - Usa Google Apps Script
   - Não precisa de Environment Variables (já está configurado no código)

---

## 📝 URLs Importantes

Após criar o projeto:

- **Dashboard:** https://vercel.com/dashboard
- **Seu Site:** `https://SEU-PROJETO-NAME.vercel.app`
- **Deployments:** Ver histórico de deploys
- **Settings:** Configurações do projeto

---

## 🆘 Troubleshooting

### Erro no Deploy:
- Verifique os logs no Vercel
- Certifique-se que `vercel.json` está correto
- Verifique se todos os arquivos estão no GitHub

### Site não carrega:
- Aguarde alguns minutos
- Limpe o cache do navegador
- Verifique a URL correta

### Login não funciona:
- Verifique se a senha é `123456`
- Limpe o localStorage do navegador
- Verifique o console (F12) para erros

---

## 🎯 Resumo Rápido

1. ✅ Acesse: https://vercel.com
2. ✅ Clique em "Add New Project"
3. ✅ Importe o repositório `Kanban-logistica`
4. ✅ Configure: Nome do projeto
5. ✅ Framework: "Other"
6. ✅ Clique em "Deploy"
7. ✅ Aguarde completar
8. ✅ Teste o site!

---

## ✅ Pronto!

Seu novo projeto está criado e online!

**URL do seu site:** `https://SEU-PROJETO-NAME.vercel.app`


