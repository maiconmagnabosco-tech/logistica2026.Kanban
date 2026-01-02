# 📝 Como Atualizar o Google Apps Script

## ⚠️ IMPORTANTE

Sim, você precisa atualizar o código no Google Apps Script para que os novos campos funcionem:
- **Prioridade** (priority)
- **Status de mudança de data** (dateChangeStatus)
- **Coluna Validação**

---

## 🔵 PASSO 1: Acessar o Google Apps Script

1. Acesse: https://script.google.com
2. Faça login com sua conta Google
3. Se você já tem um projeto criado:
   - Abra o projeto existente
4. Se não tem:
   - Clique em **"Novo projeto"**

---

## 🔵 PASSO 2: Copiar o Código Atualizado

1. Abra o arquivo `google-script.js` na pasta do projeto
2. **Selecione TODO o conteúdo** (Ctrl+A) e copie (Ctrl+C)

---

## 🔵 PASSO 3: Colar no Google Apps Script

1. No Google Apps Script, você verá um arquivo chamado `Code.gs`
2. **Apague todo o código antigo** que estiver lá
3. **Cole o código novo** que você copiou (Ctrl+V)

---

## 🔵 PASSO 4: Atualizar a Planilha (Se necessário)

### Se você já tem dados na planilha:

Você precisa adicionar 2 novas colunas:

1. Abra sua planilha do Google Sheets
2. Se a planilha já tem cabeçalhos, você precisa adicionar duas colunas:
   - **Coluna I (9)**: `prioridade`
   - **Coluna J (10)**: `dateChangeStatus`

### Se você está começando do zero:

1. No Google Apps Script, execute a função `setupSheet()`:
   - Clique no menu suspenso no topo (onde diz "doGet")
   - Selecione `setupSheet`
   - Clique no botão de play ▶️
   - Isso criará os cabeçalhos corretos na planilha

---

## 🔵 PASSO 5: Salvar e Publicar

1. **Salvar o Script:**
   - Clique em **"Salvar"** (ícone de disquete) ou pressione Ctrl+S
   - Dê um nome ao projeto: `Kanban Logistica API`

2. **Publicar como Web App:**
   - Clique em **"Implantar"** → **"Nova implantação"**
   - Clique no ícone de engrenagem ⚙️ → **"Aplicativos da Web"**
   - Configure:
     - **Descrição**: `API para Kanban Logistica`
     - **Executar como**: `Eu`
     - **Quem tem acesso**: `Qualquer pessoa` ou `Todos`
   - Clique em **"Implantar"**
   - Clique em **"Autorizar acesso"** (se pedir)
   - **COPIE A URL da Web App** (será algo como: `https://script.google.com/macros/s/...`)

3. **Atualizar a URL no código:**
   - Abra o arquivo `main.js`
   - Procure por `const API_URL =`
   - Substitua pela URL que você copiou do Google Apps Script
   - Salve o arquivo

---

## ✅ VERIFICAÇÃO FINAL

A estrutura da planilha deve ter estas colunas (em ordem):

1. **id**
2. **project**
3. **conteudo**
4. **status**
5. **setor**
6. **responsavel**
7. **data_inicio**
8. **data_fim**
9. **prioridade** ← NOVO
10. **dateChangeStatus** ← NOVO

---

## 📋 CÓDIGO COMPLETO DO GOOGLE APPS SCRIPT

```javascript
function doGet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();

    const tasks = rows.map(row => ({
        id: String(row[0]),
        project: row[1],
        content: row[2],
        columnId: row[3],
        sector: row[4],
        responsible: row[5],
        startDate: row[6],
        endDate: row[7],
        priority: row[8] || 'media',
        dateChangeStatus: row[9] || null
    })).filter(t => t.id && t.id !== 'undefined');

    return ContentService.createTextOutput(JSON.stringify({
        tasks: tasks
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let data;
    try {
        data = JSON.parse(e.postData.contents);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    if (!data || !Array.isArray(data.tasks)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing tasks array' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 10).clearContent();
    }

    if (data.tasks.length > 0) {
        const rows = data.tasks.map(t => [
            String(t.id || ''),
            String(t.project || 'Geral'),
            String(t.content || ''),
            String(t.columnId || 'todo'),
            String(t.sector || ''),
            String(t.responsible || ''),
            String(t.startDate || ''),
            String(t.endDate || ''),
            String(t.priority || 'media'),
            String(t.dateChangeStatus || '')
        ]);
        sheet.getRange(2, 1, rows.length, 10).setValues(rows);
        SpreadsheetApp.flush();
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: data.tasks.length }))
        .setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear();
    sheet.appendRow(['id', 'project', 'conteudo', 'status', 'setor', 'responsavel', 'data_inicio', 'data_fim', 'prioridade', 'dateChangeStatus']);
}
```

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Não é possível acessar a planilha"
- Verifique se você está logado com a mesma conta Google
- Verifique se você deu as permissões corretas ao script

### Os dados não aparecem
- Verifique se a URL da API está correta no `main.js`
- Verifique se o script está publicado como Web App
- Verifique se você autorizou o acesso

### Campos novos não aparecem
- Execute a função `setupSheet()` para criar os cabeçalhos corretos
- Ou adicione manualmente as colunas `prioridade` e `dateChangeStatus` na planilha

---

**Importante**: Após atualizar o Google Apps Script, você pode precisar atualizar a URL da API no arquivo `main.js` se você criou uma nova implantação.








