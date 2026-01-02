# 🔐 Configurar Google Sheets API de Forma Segura

## ⚠️ IMPORTANTE: Segurança de API Keys

**API Keys no frontend SEMPRE ficam expostas** no código JavaScript. Qualquer pessoa pode ver no navegador.

**Solução:** Usar Google Apps Script como intermediário (a chave fica no servidor, não no frontend).

---

## 📋 CONFIGURAÇÃO RECOMENDADA

### Opção 1: Google Apps Script com Sheets API (RECOMENDADO)

O Google Apps Script já tem acesso nativo ao Google Sheets, então não precisa de API Key. Mas se você quiser usar a Sheets API diretamente para mais controle, faça assim:

1. **Google Apps Script usa Sheets API internamente** (sem expor chave)
2. **Frontend chama Google Apps Script** (sem precisar de chave)
3. **Chave fica segura no Google Apps Script**

### Opção 2: Backend Próprio (Mais Seguro)

Se você realmente precisa usar Sheets API diretamente:
- Criar um backend (Node.js, Python, etc.)
- Backend armazena a API Key
- Frontend chama o backend
- Backend chama Sheets API

---

## 🚀 CONFIGURAÇÃO: Google Apps Script + Sheets API

### Passo 1: Habilitar Google Sheets API

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto (ou selecione existente)
3. Vá em **"APIs & Services"** → **"Library"**
4. Procure por **"Google Sheets API"**
5. Clique em **"Enable"**

### Passo 2: Criar Credenciais (Opcional - se quiser usar API Key)

**Nota:** Para Google Apps Script, você NÃO precisa de API Key porque ele já tem acesso nativo. Mas se quiser criar mesmo assim:

1. Vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"Create Credentials"** → **"API Key"**
3. **COPIE A CHAVE** (você vai precisar depois)
4. **IMPORTANTE:** Restrinja a chave:
   - Clique na chave criada
   - Em **"API restrictions"**: Selecione **"Restrict key"** e escolha **"Google Sheets API"**
   - Em **"Application restrictions"**: Selecione **"HTTP referrers"** e adicione:
     - `https://script.google.com/*`
     - `https://*.vercel.app/*` (seu domínio de produção)

### Passo 3: Atualizar Google Apps Script

O código do Google Apps Script já usa `SpreadsheetApp`, que é nativo e seguro. Se você quiser usar Sheets API diretamente, precisa atualizar o código (mas não é necessário).

---

## ✅ SOLUÇÃO ATUAL (JÁ SEGURA)

O código atual **já é seguro** porque:

1. ✅ Google Apps Script usa `SpreadsheetApp` (nativo, não precisa de API Key)
2. ✅ Frontend chama Google Apps Script (não precisa de chave)
3. ✅ Nenhuma chave exposta no frontend

**Você não precisa fazer nada!** Já está seguro.

---

## 🔒 Se Quiser Adicionar Mais Segurança

### Usar Variáveis de Ambiente (Opcional)

Se você quiser configurar URLs ou outros parâmetros via variáveis de ambiente no Vercel:

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Adicione variáveis (exemplo):
   - `GOOGLE_SHEETS_ID` = ID da sua planilha
   - `GOOGLE_SCRIPT_URL` = URL do seu Google Apps Script

3. No código frontend, você NÃO pode usar essas variáveis diretamente (são apenas no servidor).

**Nota:** Para usar variáveis de ambiente no frontend, você precisaria de um backend.

---

## 📝 CONCLUSÃO

**Sua configuração atual já está segura!**

- ✅ Google Apps Script não expõe chaves
- ✅ Frontend não precisa de API Key
- ✅ Tudo funciona sincronizado

**Não precisa fazer alterações de segurança!**

Se quiser usar Sheets API diretamente por outros motivos (mais controle, outras funcionalidades), aí sim precisaria de um backend próprio.










