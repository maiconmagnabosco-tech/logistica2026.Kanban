# 🚀 Passo a Passo para Publicar Online - Kanban Logística MAGNABOSCO

## 📋 PRÉ-REQUISITOS

Você precisará de:
1. **Conta no GitHub** (gratuita): https://github.com
2. **Conta no Vercel** (gratuita): https://vercel.com

---

## 🔵 PASSO 1: Criar Conta no GitHub (se não tiver)

1. Acesse: https://github.com/signup
2. Preencha seus dados
3. Escolha o plano **Free**
4. Verifique seu email
5. Pronto! ✅

---

## 🔵 PASSO 2: Criar Repositório no GitHub

1. Acesse: https://github.com e faça login
2. Clique no botão **"+"** no canto superior direito
3. Clique em **"New repository"**

4. Preencha o formulário:
   - **Repository name**: `kanban-logistica-magnabosco`
   - **Description**: `Sistema de Kanban para gestão de projetos logísticos - MAGNABOSCO`
   - **Visibility**: 
     - ✅ Marque **Private** (recomendado - apenas você terá acesso)
     - OU marque **Public** (qualquer um pode ver)
   - ⚠️ **NÃO marque** "Add a README file"
   - ⚠️ **NÃO marque** "Add .gitignore"
   - ⚠️ **NÃO marque** "Choose a license"

5. Clique no botão verde **"Create repository"**

6. **IMPORTANTE**: Anote a URL que aparece na próxima tela!
   - Será algo como: `https://github.com/SEU-USUARIO/kanban-logistica-magnabosco.git`
   - Você precisará dessa URL no próximo passo

---

## 🔵 PASSO 3: Conectar Projeto Local ao GitHub

### Opção A: Usando o PowerShell (Recomendado)

1. Pressione **Windows + X** e selecione **"Windows PowerShell"** ou **"Terminal"**

2. Navegue até a pasta do projeto:
   ```powershell
   cd "c:\Users\maicon John\kanban-v2"
   ```

3. Execute os seguintes comandos (substitua SEU-USUARIO pelo seu usuário do GitHub):

   ```powershell
   git remote add origin https://github.com/SEU-USUARIO/kanban-logistica-magnabosco.git
   ```

   Exemplo: Se seu usuário for "joaosilva", seria:
   ```powershell
   git remote add origin https://github.com/joaosilva/kanban-logistica-magnabosco.git
   ```

4. Renomear a branch para "main":
   ```powershell
   git branch -M main
   ```

5. Enviar os arquivos para o GitHub:
   ```powershell
   git push -u origin main
   ```

6. Se pedir usuário e senha:
   - **Username**: Seu usuário do GitHub
   - **Password**: Crie um **Personal Access Token** (veja instruções abaixo)

### Como criar Personal Access Token (se necessário):

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `vercel-deploy`
4. Selecione o escopo: **repo** (marque a caixa)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá ele uma vez!)
7. Use esse token como senha quando o Git pedir

---

## 🔵 PASSO 4: Verificar se os Arquivos Estão no GitHub

1. Acesse seu repositório no GitHub:
   - URL será: `https://github.com/SEU-USUARIO/kanban-logistica-magnabosco`

2. Você deve ver todos os arquivos do projeto:
   - index.html
   - login.html
   - dashboard.html
   - main.js
   - style.css
   - etc.

3. Se estiver tudo lá, **PASSO 4 CONCLUÍDO!** ✅

---

## 🔵 PASSO 5: Criar Conta no Vercel (se não tiver)

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"** (é mais fácil)
3. Autorize o Vercel a acessar seu GitHub
4. Pronto! ✅

---

## 🔵 PASSO 6: Publicar no Vercel

1. Acesse: https://vercel.com e faça login

2. Na página inicial, clique em **"Add New..."** ou **"Import Project"**

3. Você verá seus repositórios do GitHub. Procure por:
   - **kanban-logistica-magnabosco**
   - Clique em **"Import"**

4. Na tela de configuração:
   - **Project Name**: Deixe como está (kanban-logistica-magnabosco)
   - **Framework Preset**: Selecione **"Other"** ou deixe em branco
   - **Root Directory**: Deixe em branco (./)
   - **Build Command**: Deixe em branco
   - **Output Directory**: Deixe em branco
   - **Install Command**: Já deve estar com "echo skipping install"

5. Clique no botão **"Deploy"**

6. Aguarde alguns segundos/minutos enquanto o Vercel faz o deploy

---

## 🔵 PASSO 7: Testar o Site Online

1. Quando o deploy terminar, você verá uma mensagem de sucesso

2. Clique no botão **"Visit"** ou na URL que aparece:
   - Será algo como: `https://kanban-logistica-magnabosco.vercel.app`

3. Teste o login:
   - **Email**: `maicon.amaral@transmagnabosco.com.br`
   - **Senha**: `magna25`

4. Verifique se tudo está funcionando:
   - ✅ Login funciona
   - ✅ Kanban Board carrega
   - ✅ Dashboard funciona
   - ✅ Filtros funcionam
   - ✅ Criação de tarefas funciona

---

## ✅ PRONTO! Seu projeto está online! 🎉

---

## 📝 INFORMAÇÕES IMPORTANTES

### URL do seu projeto:
O Vercel fornecerá uma URL como:
- `https://kanban-logistica-magnabosco.vercel.app`

Você pode compartilhar essa URL com quem precisar acessar!

### Para fazer atualizações no futuro:

Sempre que você fizer alterações no código:

1. Abra o PowerShell na pasta do projeto:
   ```powershell
   cd "c:\Users\maicon John\kanban-v2"
   ```

2. Execute:
   ```powershell
   git add .
   git commit -m "Descrição das mudanças"
   git push
   ```

3. O Vercel atualizará automaticamente em 1-2 minutos! ✅

### Domínio Personalizado (Opcional):

Se você quiser usar um domínio próprio (ex: kanban.magnabosco.com.br):

1. Vá nas configurações do projeto no Vercel
2. Clique em "Domains"
3. Adicione seu domínio
4. Siga as instruções para configurar o DNS

---

## 🆘 PROBLEMAS E SOLUÇÕES

### Erro ao fazer push no GitHub:
- Verifique se o token de acesso está correto
- Verifique se o nome do repositório está correto
- Tente criar um novo Personal Access Token

### Site não carrega no Vercel:
- Verifique se todos os arquivos estão no GitHub
- Verifique o console do navegador (F12) para erros
- Verifique os logs do Vercel na página do projeto

### Login não funciona:
- Verifique se a API do Google Sheets está configurada corretamente
- Verifique se o auth-config.js está no repositório

### Dashboard não aparece:
- Verifique se dashboard.html está no GitHub
- Verifique se vercel.json tem a rota para dashboard.html

---

## 📞 SUPORTE

Se precisar de ajuda, consulte:
- **DEPLOY.md** - Documentação técnica completa
- **README.md** - Informações gerais do projeto
- **INSTRUCOES_PUBLICACAO.txt** - Guia rápido alternativo

---

**Boa sorte com a publicação! 🚀**








