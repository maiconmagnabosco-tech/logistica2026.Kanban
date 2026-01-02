# ⚠️ CORREÇÃO DE ERRO CORS - LEIA PRIMEIRO

## O Problema:
Você está recebendo um erro de CORS ao tentar salvar dados no cronograma.

## A Solução:
O código do Google Apps Script está correto, mas você precisa **FAZER UMA NOVA IMPLANTAÇÃO** no Google Apps Script.

## ⚡ AÇÃO URGENTE - 3 PASSOS SIMPLES:

### 1️⃣ COPIAR O CÓDIGO ATUALIZADO
- Abra o arquivo: `COPIAR_PARA_GOOGLE_SCRIPT.js`
- Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- Cole no Google Apps Script (substitua tudo que está lá)

### 2️⃣ FAZER NOVA IMPLANTAÇÃO
1. No Google Apps Script: **"Implantar"** → **"Gerenciar implantações"**
2. Clique nos **3 pontinhos** (⋮) → **"Fazer nova implantação"**
3. Ou clique em **"Nova implantação"** → ícone ⚙️ → **"Aplicativo da web"**
4. Configure:
   - **Executar como:** Eu
   - **Quem tem acesso:** ⚠️ **"Qualquer pessoa, mesmo anônimo"** ⚠️ (MUITO IMPORTANTE!)
5. Clique em **"Implantar"**
6. **COPIE A URL** que aparece (termina com `/exec`)

### 3️⃣ ATUALIZAR A URL NOS ARQUIVOS
A URL que você copiou deve ser atualizada em:
- `main.js` (linha 2)
- `schedule.js` (linha 2)  
- `dashboard.js` (linha 4)

**Já atualizei para a URL que você forneceu:** `AKfycbxSDVuI5CalRjPGIvtvOfnUzKC3CiWyzaxsqdSZSKfS3KC0C13EP1ZFXUTtIu3-dOBC/exec`

## ✅ Verificação:
Após seguir os 3 passos acima:
1. Faça deploy no Netlify
2. Teste salvar um plantão
3. Se ainda der erro, verifique se a implantação está como **"Qualquer pessoa, mesmo anônimo"**

## 📄 Para mais detalhes:
Leia o arquivo: `RESOLVER_CORS_PASSO_A_PASSO.md`





