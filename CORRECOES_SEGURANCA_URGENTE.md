# 🚨 Correções de Segurança Urgentes - Guia Rápido

## ⚠️ **CORREÇÕES IMEDIATAS NECESSÁRIAS**

Este guia fornece correções rápidas para as vulnerabilidades mais críticas.

---

## 🔴 **1. CORREÇÃO XSS - Proteção contra Script Injection**

### Problema:
Dados do usuário são inseridos diretamente no HTML sem sanitização.

### Solução Rápida:

**Substituir `innerHTML` por `textContent` onde possível:**

```javascript
// ❌ ANTES (VULNERÁVEL):
div.innerHTML = `<span class="task-content">${task.content}</span>`;

// ✅ DEPOIS (SEGURO):
const span = document.createElement('span');
span.className = 'task-content';
span.textContent = task.content; // textContent escapa automaticamente
div.appendChild(span);
```

**Locais para corrigir em `main.js`:**

1. **Linha ~484** (createCard):
```javascript
// ANTES:
div.innerHTML = `
    <span class="task-content">${task.content}</span>
    ...
`;

// DEPOIS: Usar createElement e textContent
const contentSpan = document.createElement('span');
contentSpan.className = 'task-content';
contentSpan.textContent = task.content;
div.appendChild(contentSpan);
```

2. **Linha ~350** (renderBoard - mensagem vazia):
```javascript
// ANTES:
board.innerHTML = `<div style="color:#666;">${msg}</div>`;

// DEPOIS:
const emptyDiv = document.createElement('div');
emptyDiv.style.color = '#666';
emptyDiv.textContent = msg;
board.appendChild(emptyDiv);
```

---

## 🔴 **2. CORREÇÃO AUTENTICAÇÃO - Proteger API**

### Adicionar Validação no Google Apps Script:

**Edite `google-script.js` e adicione no início de `doGet` e `doPost`:**

```javascript
function doGet(e) {
    // NOVO: Validar origem
    const allowedOrigins = [
        'https://kanban-logistica-magnabosco.vercel.app',
        'http://localhost:8000' // Para desenvolvimento local
    ];
    
    // Obter origem da requisição (se disponível)
    const origin = e.parameter.origin || '';
    
    // Validar se a origem é permitida (opcional mas recomendado)
    // Nota: Google Apps Script não expõe headers HTTP diretamente
    
    // Resto do código...
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // ... continuação
}

function doPost(e) {
    // NOVO: Validar tamanho máximo de dados
    try {
        const dataSize = e.postData.contents.length;
        if (dataSize > 1000000) { // 1MB máximo
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Payload too large' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // NOVO: Validar estrutura básica
        let data = JSON.parse(e.postData.contents);
        if (!data || !Array.isArray(data.tasks)) {
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Invalid data structure' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // NOVO: Limitar número de tarefas
        if (data.tasks.length > 10000) {
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Too many tasks' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        // NOVO: Validar e sanitizar cada tarefa
        data.tasks = data.tasks.map(task => {
            return {
                id: String(task.id || '').substring(0, 100), // Limitar tamanho
                project: String(task.project || 'Geral').substring(0, 200),
                content: String(task.content || '').substring(0, 500),
                columnId: ['todo', 'inprogress', 'validation', 'done'].includes(task.columnId) 
                    ? task.columnId 
                    : 'todo', // Validar valores permitidos
                sector: String(task.sector || '').substring(0, 100),
                responsible: String(task.responsible || '').substring(0, 100),
                startDate: String(task.startDate || '').substring(0, 50),
                endDate: String(task.endDate || '').substring(0, 50),
                priority: ['baixa', 'media', 'alta'].includes(task.priority)
                    ? task.priority
                    : 'media', // Validar valores permitidos
                dateChangeStatus: String(task.dateChangeStatus || '').substring(0, 50)
            };
        });
        
        // Resto do código original...
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        // ... continuação
    } catch (err) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Invalid JSON' })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}
```

---

## 🔴 **3. CORREÇÃO AUTENTICAÇÃO - Mover Senha**

### Mover senha para variável de ambiente:

**1. No Vercel:**
- Vá em Settings → Environment Variables
- Adicione: `KANBAN_PASSWORD` = `magna25`

**2. No código (se usar build):**
```javascript
// Em vez de:
const AUTH_PASSWORD = 'magna25';

// Usar (se possível):
const AUTH_PASSWORD = process.env.KANBAN_PASSWORD || 'magna25';
```

**⚠️ Nota:** Como é site estático, a senha ainda ficará exposta. Considere implementar autenticação real.

---

## 🟠 **4. PROTEÇÃO ADICIONAL - Content Security Policy**

**Adicione no `index.html` e `dashboard.html` no `<head>`:**

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;
               connect-src 'self' https://script.google.com;">
```

---

## ✅ **CHECKLIST RÁPIDO**

Após fazer as correções:

- [ ] Substituir `innerHTML` por `textContent` em todos os lugares onde dados do usuário são exibidos
- [ ] Adicionar validação no Google Apps Script (`doPost`)
- [ ] Limitar tamanho de dados no backend
- [ ] Validar valores permitidos (columnId, priority)
- [ ] Adicionar CSP headers (opcional mas recomendado)
- [ ] Testar se ainda funciona após as mudanças

---

## 🧪 **TESTE DE SEGURANÇA**

Após implementar as correções, teste:

```javascript
// No console do navegador, tente:
// 1. Criar tarefa com XSS:
//    task.content = '<img src=x onerror="alert(1)">'
//    → Não deve executar o alert

// 2. Verificar se dados são sanitizados:
//    → HTML não deve ser renderizado, apenas texto

// 3. Tentar enviar dados maliciosos:
//    → Backend deve rejeitar ou sanitizar
```

---

## 📝 **NOTAS IMPORTANTES**

1. **Essas são correções rápidas**, mas não substituem uma solução de segurança completa
2. **Para produção**, considere implementar:
   - Autenticação real (OAuth, Firebase Auth)
   - HTTPS obrigatório (já garantido pelo Vercel)
   - Rate limiting
   - Logs de auditoria
   - Backup automático

3. **Revise regularmente** a segurança do sistema

---

**Última atualização:** Dezembro 2024








