# 🚀 Guia de Publicação - Kanban Logística | MAGNABOSCO

## 📋 Pré-requisitos

1. **Conta no GitHub** (gratuita): https://github.com
2. **Conta no Vercel** (gratuita): https://vercel.com

## 🔧 Passo a Passo para Publicar

### 1. Preparar o Repositório Git

Abra o terminal na pasta do projeto e execute:

```bash
cd "c:\Users\maicon John\kanban-v2"

# Adicionar todos os arquivos
git add .

# Fazer o commit inicial
git commit -m "Versão inicial do Kanban Logística MAGNABOSCO"
```

### 2. Criar Repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `kanban-logistica-magnabosco` (ou outro nome de sua escolha)
   - **Description**: "Sistema de Kanban para gestão de projetos logísticos"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO marque** "Initialize this repository with a README"
5. Clique em **"Create repository"**

### 3. Conectar e Publicar no GitHub

Após criar o repositório, GitHub mostrará instruções. Execute no terminal:

```bash
# Adicionar o repositório remoto (SUBSTITUA 'seu-usuario' pelo seu usuário do GitHub)
git remote add origin https://github.com/seu-usuario/kanban-logistica-magnabosco.git

# Renomear branch para main (se necessário)
git branch -M main

# Publicar no GitHub
git push -u origin main
```

### 4. Publicar no Vercel

1. Acesse https://vercel.com e faça login (pode usar sua conta do GitHub)
2. Clique em **"Add New Project"** ou **"Import Project"**
3. Selecione o repositório `kanban-logistica-magnabosco`
4. Configure o projeto:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (deixe em branco)
   - **Build Command**: (deixe em branco - não precisa)
   - **Output Directory**: `.` (deixe em branco)
5. Clique em **"Deploy"**

### 5. Configurar Domínio (Opcional)

Após o deploy, o Vercel fornecerá uma URL como: `https://kanban-logistica-magnabosco.vercel.app`

Você pode:
- Usar essa URL diretamente
- Configurar um domínio personalizado nas configurações do projeto no Vercel

## ✅ Verificações Pós-Deploy

1. Acesse a URL fornecida pelo Vercel
2. Teste o login com:
   - Email: `maicon.amaral@transmagnabosco.com.br`
   - Senha: `magna25`
3. Verifique se todas as funcionalidades estão funcionando:
   - Kanban Board
   - Dashboard
   - Filtros
   - Criação/Edição de tarefas
   - Drag and drop

## 🔄 Atualizações Futuras

Para atualizar o projeto após fazer mudanças:

```bash
# Adicionar alterações
git add .

# Commit com descrição
git commit -m "Descrição das alterações"

# Publicar no GitHub
git push

# O Vercel atualizará automaticamente!
```

## 📝 Notas Importantes

1. **Google Sheets API**: Certifique-se de que a URL da API no `main.js` está correta
2. **Google Apps Script**: O script em `google-script.js` deve ser implementado no Google Apps Script
3. **Permissões**: O sistema de permissões está configurado no `auth-config.js`
4. **Senha**: A senha atual é `magna25` (pode ser alterada no `auth-config.js`)

## 🆘 Problemas Comuns

### Erro 404 no Dashboard
- Verifique se `dashboard.html` está no repositório
- Verifique as rotas no `vercel.json`

### API não funciona
- Verifique se a URL da API está correta no `main.js`
- Verifique se o Google Apps Script está publicado e acessível

### Fotos não aparecem
- As fotos são armazenadas no `localStorage` do navegador (não no servidor)
- Cada usuário deve fazer upload de sua própria foto

---

**Sucesso!** Seu projeto está online! 🎉








