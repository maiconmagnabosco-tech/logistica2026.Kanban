# 🚀 Deploy no Vercel AGORA - Sem GitHub

Guia rápido para colocar seu projeto online no Vercel usando apenas a linha de comando (CLI).

---

## ✅ PRÉ-REQUISITO: Node.js

Se você não tem Node.js instalado:

1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** (Long Term Support)
3. Instale executando o instalador
4. Reinicie o terminal/PowerShell após instalar

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Instalar Vercel CLI

Abra o **PowerShell** ou **Prompt de Comando** e execute:

```bash
npm install -g vercel
```

Aguarde a instalação terminar (pode levar 1-2 minutos).

---

### 2️⃣ Fazer Login no Vercel

Execute no terminal:

```bash
vercel login
```

Isso vai:
- Abrir seu navegador automaticamente
- Pedir para fazer login (pode usar Google, GitHub ou email)
- Autorizar o acesso

**Após fazer login no navegador, volte ao terminal** e você estará logado!

---

### 3️⃣ Ir para a Pasta do Projeto

No terminal, execute:

```bash
cd "C:\Users\maicon John\kanban-v2"
```

Ou simplesmente navegue até a pasta pelo Explorador de Arquivos, clique com botão direito dentro da pasta e escolha "Abrir no Terminal" ou "Abrir PowerShell aqui".

---

### 4️⃣ Fazer Deploy

**OPÇÃO A - Usando o arquivo .bat (MAIS FÁCIL):**

1. Abra a pasta do projeto no Explorador
2. Dê **duplo clique** no arquivo: `DEPLOY_VERCEL.bat`
3. Aguarde o deploy terminar

**OPÇÃO B - Pelo terminal:**

Execute:

```bash
vercel --prod
```

---

### 5️⃣ Responder as Perguntas

O Vercel vai fazer algumas perguntas (na primeira vez):

1. **Set up and deploy?** → Digite `Y` e pressione Enter
2. **Which scope?** → Escolha sua conta (geralmente só tem uma opção)
3. **Link to existing project?** → Digite `N` e pressione Enter
4. **What's your project's name?** → Digite `kanban-logistica-magnabosco` (ou outro nome) e pressione Enter
5. **In which directory is your code located?** → Apenas pressione Enter (pasta atual)
6. **Want to override the settings?** → Digite `N` e pressione Enter

---

### 6️⃣ Aguardar Deploy

O Vercel vai:
- ✅ Enviar os arquivos
- ✅ Configurar o projeto
- ✅ Fazer o deploy

Isso leva cerca de **1-2 minutos**.

---

### 7️⃣ Copiar a URL

Quando terminar, você verá algo como:

```
✅ Production: https://kanban-logistica-magnabosco.vercel.app
```

**Copie essa URL!** Esse é o link do seu site online! 🎉

---

## 🔄 ATUALIZAR O SITE (Próximas Vezes)

Quando você fizer mudanças no código, para atualizar o site:

1. Abra o terminal na pasta do projeto
2. Execute: `vercel --prod`
3. Aguarde terminar
4. Pronto! Site atualizado!

Ou simplesmente dê duplo clique no `DEPLOY_VERCEL.bat` novamente.

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

Após o deploy, teste:

1. Acesse a URL que o Vercel forneceu
2. Faça login com:
   - Email: `maicon.amaral@transmagnabosco.com.br`
   - Senha: `magna25`
3. Verifique se:
   - ✅ Tela de login funciona
   - ✅ Kanban Board carrega
   - ✅ Tarefas aparecem
   - ✅ Dashboard funciona
   - ✅ Criar/editar/deletar tarefas funciona

---

## 🆘 PROBLEMAS COMUNS

### Erro: "vercel não é reconhecido como comando"

**Solução:** Node.js não está instalado ou o terminal não foi reiniciado após instalar.

1. Instale Node.js: https://nodejs.org
2. Reinicie o terminal
3. Execute: `npm install -g vercel`

### Erro: "Não autorizado" ou "Login required"

**Solução:** Você não está logado.

1. Execute: `vercel login`
2. Faça login no navegador que abrir
3. Tente novamente

### Erro: "Project already exists"

**Solução:** Você já fez deploy antes. Isso é normal!

1. Responda `Y` quando perguntar se quer vincular ao projeto existente
2. Ou escolha outro nome de projeto

---

## 📝 NOTAS IMPORTANTES

- ✅ **Não precisa de GitHub** - O deploy é direto pela linha de comando
- ✅ **Gratuito** - Vercel tem plano gratuito generoso
- ✅ **HTTPS automático** - Seu site já vem com certificado SSL
- ✅ **URL personalizada** - Você pode configurar um domínio próprio depois
- ✅ **Deploy rápido** - Geralmente leva 1-2 minutos

---

## 🎯 RESUMO RÁPIDO

1. Instalar: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod` (ou duplo clique em `DEPLOY_VERCEL.bat`)
4. Copiar URL e testar!

**Pronto! Seu site estará online!** 🚀










