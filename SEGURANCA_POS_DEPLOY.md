# 🔒 Segurança Pós-Deploy - Ações Imediatas

## ⚠️ IMPORTANTE: Leia Antes de Fazer Deploy!

Este documento lista as **ações de segurança** que devem ser tomadas **após** fazer o deploy do projeto online.

---

## 🚨 Problemas de Segurança Conhecidos

### 1. API do Google Apps Script Exposta
- ✅ **Status:** A URL da API está no código frontend
- ⚠️ **Risco:** Qualquer pessoa pode acessar e modificar dados se tiver a URL
- 🔧 **Solução:** Implementar validação de origem no Google Apps Script

### 2. Autenticação Baseada em localStorage
- ✅ **Status:** Login apenas no frontend
- ⚠️ **Risco:** Fácil de burlar (qualquer um pode se autenticar)
- 🔧 **Solução:** Implementar autenticação real no backend

### 3. Senha Hardcoded
- ✅ **Status:** Senha `magna25` está no código
- ⚠️ **Risco:** Qualquer um pode ver a senha no código fonte
- 🔧 **Solução:** Considerar usar variáveis de ambiente (parcialmente seguro)

---

## ✅ Ação 1: Proteger Google Apps Script (PRIORITÁRIO)

### Passo a Passo:

#### 1. Abrir Google Apps Script
1. Acesse: https://script.google.com
2. Abra o projeto do Kanban

#### 2. Adicionar Validação de Origem

Edite o código do Google Apps Script e adicione no início das funções:

```javascript
// Configuração de origens permitidas
const ALLOWED_ORIGINS = [
    'https://seu-projeto.vercel.app',  // ← SUBSTITUA pela URL do seu deploy
    'https://seu-projeto.netlify.app', // ← Se usar Netlify
    'http://localhost:8000',           // ← Para desenvolvimento local
    'file://'                          // ← Para testes locais (remover em produção)
];

// Função para validar origem
function isValidOrigin(e) {
    // Nota: Google Apps Script não expõe headers HTTP diretamente
    // Esta é uma validação básica - considere implementar tokens
    return true; // Temporariamente permite tudo
}

// Função para validar token simples (melhoria básica)
function validateToken(token) {
    // Token simples baseado em timestamp + hash
    // IMPORTANTE: Esta é uma solução básica - considere algo mais robusto
    const validTokens = [
        // Adicione tokens válidos aqui (gerados pelo frontend)
    ];
    return validTokens.includes(token);
}
```

#### 3. Modificar doGet() e doPost()

```javascript
function doGet(e) {
    // Validar origem (básico)
    // Nota: Google Apps Script tem limitações para validação de origem HTTP
    // Para maior segurança, considere implementar autenticação por token
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // ... resto do código original ...
}

function doPost(e) {
    // Validar tamanho do payload
    try {
        const dataSize = e.postData ? e.postData.contents.length : 0;
        if (dataSize > 1000000) { // 1MB máximo
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Payload too large' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Validar estrutura
        let data = JSON.parse(e.postData.contents);
        if (!data || !Array.isArray(data.tasks)) {
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Invalid data structure' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Limitar número de tarefas
        if (data.tasks.length > 10000) {
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Too many tasks' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // ... resto do código original ...
    } catch (error) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Invalid request' })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}
```

#### 4. Salvar e Fazer Novo Deploy
1. Salve o código no Google Apps Script
2. Vá em **"Implantar"** → **"Gerenciar implantações"**
3. Clique nos **3 pontinhos** → **"Fazer nova implantação"**
4. Escolha a mesma configuração anterior
5. Clique em **"Implantar"**

---

## ✅ Ação 2: Limitar Acesso ao Google Sheets

### Opções:

#### Opção A: Compartilhar apenas com emails específicos
1. Abra sua planilha no Google Sheets
2. Clique em **"Compartilhar"** (canto superior direito)
3. Configure:
   - ✅ **Adicionar pessoas e grupos:** Adicione apenas emails da empresa
   - ✅ **Acesso:** "Visualizador" ou "Editor" (conforme necessário)
   - ✅ **Desmarque:** "Qualquer pessoa com o link pode visualizar"
4. Clique em **"Concluído"**

#### Opção B: Usar Google Workspace
- Se sua empresa usa Google Workspace, configure domínio restrito
- Apenas emails `@transmagnabosco.com.br` terão acesso

---

## ✅ Ação 3: Configurar CORS (Opcional mas Recomendado)

### No Google Apps Script:

```javascript
function doGet(e) {
    // Configurar CORS
    const output = ContentService.createTextOutput(JSON.stringify({
        tasks: tasks
    })).setMimeType(ContentService.MimeType.JSON);
    
    // Nota: Google Apps Script gerencia CORS automaticamente
    // Mas você pode adicionar validações adicionais aqui
    
    return output;
}
```

---

## ✅ Ação 4: Implementar Rate Limiting (Avançado)

### Limitar número de requisições:

No Google Apps Script, adicione um registro simples:

```javascript
// Armazenar última requisição por IP (usando PropertiesService)
function checkRateLimit() {
    const scriptProperties = PropertiesService.getScriptProperties();
    const now = Date.now();
    const lastRequest = scriptProperties.getProperty('last_request');
    
    if (lastRequest) {
        const timeDiff = now - parseInt(lastRequest);
        if (timeDiff < 1000) { // Menos de 1 segundo
            throw new Error('Rate limit exceeded');
        }
    }
    
    scriptProperties.setProperty('last_request', now.toString());
}
```

---

## ✅ Ação 5: Monitorar Acesso (Recomendado)

### Adicionar Logs Simples:

```javascript
function logAccess(action, email) {
    try {
        const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
        if (!logSheet) {
            // Criar sheet de logs se não existir
            const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Logs');
            sheet.getRange(1, 1, 1, 4).setValues([['Data', 'Hora', 'Ação', 'Email']]);
            return;
        }
        
        logSheet.appendRow([
            new Date(),
            Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm:ss'),
            action,
            email || 'N/A'
        ]);
    } catch (error) {
        // Falha silenciosa - não bloquear operação
        console.error('Log error:', error);
    }
}
```

Chame `logAccess()` nas funções `doGet()` e `doPost()`.

---

## 🔐 Configurações Adicionais de Segurança

### 1. Headers de Segurança (Já Configurado no vercel.json)

O arquivo `vercel.json` já tem alguns headers de segurança:
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`

### 2. HTTPS (Automático)

Todas as plataformas de deploy (Vercel, Netlify, Firebase) fornecem HTTPS automaticamente.

### 3. Backups

- ✅ Configure backup automático do Google Sheets
- ✅ Faça backup periódico dos dados importantes

---

## 📋 Checklist de Segurança Pós-Deploy

Após fazer o deploy, verifique:

- [ ] Google Apps Script tem validação de tamanho de payload
- [ ] Google Sheets não está público (configurado compartilhamento)
- [ ] Logs estão funcionando (se implementado)
- [ ] Rate limiting está ativo (se implementado)
- [ ] Testou o acesso com usuários não autorizados (deve ser bloqueado)
- [ ] Backups estão configurados

---

## 🚨 O Que Fazer se Houver Comprometimento

### Se descobrir acesso não autorizado:

1. **Imediatamente:**
   - Desabilite o Google Apps Script temporariamente
   - Revise os logs (se tiver)
   - Altere qualquer senha relacionada

2. **Avaliar danos:**
   - Verifique se dados foram modificados
   - Verifique se dados foram excluídos
   - Identifique qual foi o acesso não autorizado

3. **Corrigir:**
   - Implemente as correções de segurança acima
   - Reative o Google Apps Script com novas proteções
   - Notifique usuários se necessário

---

## 📝 Notas Importantes

### Limitações do Google Apps Script:

- ⚠️ Não expõe headers HTTP diretamente (dificulta validação de origem)
- ⚠️ CORS é gerenciado automaticamente pelo Google
- ⚠️ Rate limiting nativo é limitado

### Recomendações para Uso em Produção:

Para um ambiente mais seguro em produção, considere:

1. **Backend próprio** (Node.js, Python, etc.)
2. **Autenticação real** (OAuth 2.0, JWT)
3. **Banco de dados próprio** (não Google Sheets)
4. **Monitoramento e alertas** (Sentry, LogRocket, etc.)

---

## ✅ Resumo Rápido

**Após fazer deploy:**

1. ✅ Proteger Google Apps Script (validação de payload)
2. ✅ Limitar acesso ao Google Sheets (compartilhamento)
3. ✅ Considerar logs de acesso
4. ✅ Monitorar uso e acessos suspeitos
5. ✅ Fazer backups regulares

---

**Última atualização:** Dezembro 2024










