# 🚀 Deploy no Vercel SEM GitHub - Passo a Passo Completo

Este guia mostra como fazer deploy do seu projeto Kanban no Vercel **diretamente da sua máquina**, sem precisar usar GitHub.

## 📋 Pré-requisitos

1. Conta no Vercel (crie em: https://vercel.com/signup)
2. Node.js instalado (para usar a CLI do Vercel)
3. Todos os arquivos do projeto na pasta atual

---

## 🔧 PASSO 1: Instalar a CLI do Vercel

Abra o PowerShell ou Prompt de Comando e execute:

```bash
npm install -g vercel
```

**OU** se preferir usar npx (sem instalar globalmente):

```bash
npx vercel
```

---

## 🔑 PASSO 2: Fazer Login no Vercel

No terminal, execute:

```bash
vercel login
```

Isso vai abrir o navegador para você fazer login na sua conta do Vercel.

**Alternativa:** Se preferir login via email:

```bash
vercel login --email seu-email@exemplo.com
```

---

## 🚀 PASSO 3: Fazer Deploy (Primeira Vez)

Na pasta do seu projeto, execute:

```bash
vercel
```

O Vercel vai perguntar:

1. **"Set up and deploy"** → Pressione **Enter** (ou digite Y)
2. **"Which scope"** → Selecione sua conta/organização
3. **"Link to existing project?"** → Digite **N** (se for a primeira vez)
4. **"What's your project's name?"** → Digite o nome do projeto (ex: `kanban-v2`)
5. **"In which directory is your code located?"** → Pressione **Enter** (pasta atual: `./`)
6. **"Want to override the settings?"** → Digite **N**

O deploy vai começar automaticamente!

---

## 🎯 PASSO 4: Fazer Deploy para Produção

Após o primeiro deploy, você terá uma URL de preview. Para fazer deploy em **produção** (URL final), execute:

```bash
vercel --prod
```

**OU** use o alias:

```bash
vercel -p
```

---

## ⚡ Deploy Rápido (Usando o Script .bat)

Você já tem um arquivo `DEPLOY_VERCEL.bat` configurado! Basta:

1. **Duplo clique** no arquivo `DEPLOY_VERCEL.bat`
2. Ou execute no terminal: `DEPLOY_VERCEL.bat`

O script vai:
- Verificar se o Vercel CLI está instalado
- Fazer o deploy automaticamente para produção

---

## 📝 Comandos Úteis

### Ver status do projeto
```bash
vercel ls
```

### Ver informações do projeto atual
```bash
vercel inspect
```

### Ver logs do deploy
```bash
vercel logs
```

### Remover um projeto
```bash
vercel remove nome-do-projeto
```

### Fazer deploy apenas de preview (não produção)
```bash
vercel
```

---

## 🔄 Atualizações Futuras

Para fazer **novos deploys** (após o primeiro), basta:

```bash
vercel --prod
```

Ou usar o script `DEPLOY_VERCEL.bat`

---

## ⚙️ Configuração Atual (vercel.json)

Seu projeto já está configurado com:

- ✅ Rotas para todas as páginas HTML
- ✅ Suporte para arquivos estáticos (JS, CSS, imagens)
- ✅ Headers de segurança
- ✅ Redirecionamento para index.html

O arquivo `vercel.json` já está pronto e não precisa ser modificado!

---

## 🆘 Resolução de Problemas

### Erro: "Vercel CLI not found"
```bash
npm install -g vercel
```

### Erro: "Not logged in"
```bash
vercel login
```

### Erro: "Project not found"
Na primeira vez, certifique-se de responder **N** para "Link to existing project?"

### Limpar cache do Vercel
O Vercel não faz cache dos arquivos por padrão, mas se necessário:
```bash
vercel --force
```

---

## 🌐 URLs Após Deploy

Após o deploy, você receberá:

- **URL de Produção:** `https://kanban-v2.vercel.app` (ou nome que você escolheu)
- **URL de Preview:** Para cada commit/deploy, uma URL única

---

## ✅ Checklist Final

- [ ] Node.js instalado
- [ ] Vercel CLI instalado (`npm install -g vercel`)
- [ ] Login feito (`vercel login`)
- [ ] Na pasta do projeto
- [ ] Executar `vercel --prod` ou `DEPLOY_VERCEL.bat`
- [ ] Copiar a URL de produção
- [ ] Testar o site online

---

## 🎉 Pronto!

Seu site estará online em alguns segundos! O Vercel é muito rápido no deploy.

**Tempo estimado:** 2-5 minutos (incluindo instalação da CLI)

---

## 📞 Precisa de Ajuda?

- Documentação oficial: https://vercel.com/docs/cli
- Status do Vercel: https://www.vercel-status.com/



