# 🚀 Guia Completo - Deploy Online

## ✅ Status Atual

- ✅ Salvamento funcionando
- ✅ API configurada
- ✅ Dados compartilhados entre usuários (mesma planilha Google Sheets)
- ✅ Pronto para deploy online

---

## 🎯 Objetivo

Deixar o projeto online para que:
- ✅ Qualquer pessoa possa acessar
- ✅ Todos vejam as mesmas informações
- ✅ Cada usuário possa ver o que outros criaram
- ✅ Dados salvos sejam compartilhados

**Isso já está funcionando!** O Google Apps Script usa a mesma planilha para todos.

---

## 📦 Opção 1: Netlify Drop (MAIS FÁCIL - Recomendado)

### ✅ Vantagens:
- 100% online - Zero instalação
- Arrastar e soltar arquivos
- Gratuito e ilimitado
- HTTPS automático
- URL personalizada

### 📝 Passo a Passo:

#### 1. Preparar Arquivos

1. Vá até a pasta do projeto: `C:\Users\maicon John\Logistica 2026`
2. **Selecione TODOS os arquivos** (Ctrl+A)
   - ⚠️ **IMPORTANTE:** Selecione os **arquivos**, não a pasta
3. **Botão direito** → **Enviar para** → **Pasta compactada (zip)**
4. Será criado um arquivo ZIP

**✅ Estrutura CORRETA do ZIP:**
```
Logistica 2026.zip
  ├── index.html
  ├── login.html
  ├── dashboard.html
  ├── schedule.html
  ├── main.js
  ├── schedule.js
  ├── dashboard.js
  ├── auth-config.js
  ├── style.css
  ├── vercel.json
  ├── netlify.toml
  ├── images/
  │   └── trucks-background.jpg
  └── ... (outros arquivos)
```

**❌ Estrutura ERRADA (não faça assim):**
```
Logistica 2026.zip
  └── Logistica 2026/     ← NÃO deve ter esta subpasta!
      ├── index.html
      └── ...
```

#### 2. Acessar Netlify Drop

1. Abra o navegador
2. Acesse: **https://app.netlify.com/drop**
3. Faça login (pode usar email, Google ou GitHub)
   - Se não tiver conta, crie uma (gratuito)

#### 3. Fazer Upload

1. **Arraste** o arquivo ZIP para a área indicada
2. Aguarde 1-2 minutos
3. **Pronto!** ✅

#### 4. Personalizar URL (Opcional)

1. No painel do Netlify, clique em **"Site settings"**
2. Clique em **"Change site name"**
3. Escolha um nome (ex: `kanban-magnabosco`)
4. URL ficará: `https://kanban-magnabosco.netlify.app`

#### 5. Testar

1. Acesse a URL gerada
2. Faça login
3. Teste criar uma tarefa
4. Abra em outro navegador/usuário e verifique se vê a mesma tarefa

---

## 📦 Opção 2: Cloudflare Pages (Alternativa)

### ✅ Vantagens:
- 100% online
- Upload de ZIP via interface
- Super rápido
- Gratuito

### 📝 Passo a Passo:

1. Acesse: **https://dash.cloudflare.com**
2. Faça login (gratuito)
3. No menu lateral, clique em **"Workers & Pages"**
4. Clique em **"Create"** → **"Pages"** → **"Upload assets"**
5. Clique em **"Select ZIP file"**
6. Escolha o arquivo ZIP
7. Dê um nome ao projeto
8. Clique em **"Deploy site"**
9. Aguarde 1-2 minutos
10. URL será: `https://nome-do-projeto.pages.dev`

---

## 📦 Opção 3: Vercel (Se Tiver GitHub)

Se você tiver conta no GitHub:

1. Acesse: **https://vercel.com**
2. Faça login com GitHub
3. Clique em **"Add New"** → **"Project"**
4. Conecte seu repositório GitHub
5. Configure:
   - Framework: **Other**
   - Deixe o resto padrão
6. Clique em **"Deploy"**

---

## ✅ Verificações Após Deploy

### 1. Testar Acesso

1. Acesse a URL do site
2. Deve abrir a tela de login
3. Faça login com credenciais válidas

### 2. Testar Funcionalidades

- [ ] Login funciona
- [ ] Kanban carrega tarefas
- [ ] Criar nova tarefa funciona
- [ ] Drag and drop funciona
- [ ] Dashboard carrega
- [ ] Cronograma carrega
- [ ] Salvar plantão funciona

### 3. Testar Compartilhamento de Dados

**IMPORTANTE:** Para verificar se os dados são compartilhados:

1. **Usuário 1:**
   - Acesse o site
   - Faça login
   - Crie uma tarefa ou plantão
   - Salve

2. **Usuário 2 (outro navegador/usuário):**
   - Acesse o mesmo site
   - Faça login
   - **Deve ver a tarefa/plantão criado pelo Usuário 1**

Se ambos veem os mesmos dados = ✅ Funcionando!

---

## 🔒 Segurança e Acesso

### Autenticação

O sistema usa autenticação local (localStorage). Isso significa:

- ✅ Qualquer pessoa pode acessar o site
- ✅ Precisa fazer login para usar
- ✅ Senhas estão no código (não é ideal para produção, mas funciona)

### Dados Compartilhados

- ✅ Todos os usuários veem as mesmas tarefas
- ✅ Todos os usuários veem o mesmo cronograma
- ✅ Dados salvos por um usuário aparecem para todos
- ✅ Usa a mesma planilha Google Sheets

---

## 📝 Checklist Final

### Antes do Deploy:
- [x] Salvamento funcionando localmente
- [x] API configurada e funcionando
- [x] Todos os arquivos presentes
- [ ] Arquivos compactados em ZIP (estrutura correta)

### Durante o Deploy:
- [ ] Escolhida plataforma (Netlify/Cloudflare/Vercel)
- [ ] ZIP enviado
- [ ] Deploy concluído
- [ ] URL gerada

### Após o Deploy:
- [ ] Site acessível
- [ ] Login funciona
- [ ] Criar tarefa funciona
- [ ] Dados são compartilhados (teste com 2 usuários)
- [ ] Todas as funcionalidades testadas

---

## 🎯 Recomendação

**Use Netlify Drop** - É o mais fácil e rápido:
1. Compactar arquivos
2. Arrastar para https://app.netlify.com/drop
3. Pronto!

**Tempo estimado:** 5 minutos

---

## 🆘 Problemas Comuns

### "Site não carrega"
- Verifique se compactou os **arquivos** e não a **pasta**
- O `index.html` deve estar na **raiz** do ZIP

### "Erro 404"
- Certifique-se que o arquivo principal é `login.html` ou `index.html`
- Verifique se todos os arquivos estão no ZIP

### "API não funciona"
- Verifique se a URL da API está correta nos arquivos
- Verifique se o Google Apps Script está publicado como "Qualquer pessoa"

### "Dados não aparecem para outros usuários"
- Isso é normal! Os dados são salvos no Google Sheets
- Pode levar alguns segundos para aparecer
- Recarregue a página (F5)

---

## 📞 Próximos Passos

1. **Escolha uma plataforma** (recomendado: Netlify Drop)
2. **Compacte os arquivos** em ZIP
3. **Faça upload**
4. **Teste o site online**
5. **Compartilhe a URL** com sua equipe

---

**Status:** ✅ Pronto para deploy!  
**Tempo estimado:** 5-10 minutos  
**Dificuldade:** ⭐ Muito Fácil





