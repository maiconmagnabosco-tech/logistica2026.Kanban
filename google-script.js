function doGet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();

    const tasks = rows.map(row => ({
        id: String(row[0]),
        project: row[1],
        objective: row[2] || '',
        content: row[3],
        columnId: row[4],
        sector: row[5],
        responsible: row[6],
        startDate: row[7],
        endDate: row[8],
        priority: row[9] || 'media',
        dateChangeStatus: row[10] || null
    })).filter(t => t.id && t.id !== 'undefined');

    return ContentService.createTextOutput(JSON.stringify({
        tasks: tasks
    })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let data;
    
    try {
        // Validar tamanho máximo do payload (1MB)
        const payloadSize = e.postData.contents.length;
        if (payloadSize > 1000000) {
            return ContentService.createTextOutput(
                JSON.stringify({ status: 'error', message: 'Payload too large (max 1MB)' })
            ).setMimeType(ContentService.MimeType.JSON);
        }
        
        data = JSON.parse(e.postData.contents);
    } catch (err) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Invalid JSON' })
        ).setMimeType(ContentService.MimeType.JSON);
    }

    if (!data || !Array.isArray(data.tasks)) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Missing tasks array' })
        ).setMimeType(ContentService.MimeType.JSON);
    }

    // Validar número máximo de tarefas (10.000)
    if (data.tasks.length > 10000) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Too many tasks (max 10000)' })
        ).setMimeType(ContentService.MimeType.JSON);
    }

    // Valores permitidos para validação
    const allowedColumnIds = ['todo', 'inprogress', 'validation', 'done'];
    const allowedPriorities = ['baixa', 'media', 'alta'];
    const allowedDateChangeStatus = ['', 'postergada', 'antecipada'];

    // Validar e sanitizar cada tarefa
    try {
        const rows = data.tasks.map(t => {
            // Sanitizar e limitar tamanho de cada campo
            const id = String(t.id || '').substring(0, 100);
            const project = String(t.project || 'Geral').substring(0, 200);
            const objective = String(t.objective || '').substring(0, 1000);
            const content = String(t.content || '').substring(0, 500);
            const columnId = (allowedColumnIds.includes(String(t.columnId || ''))) 
                ? String(t.columnId) 
                : 'todo';
            const sector = String(t.sector || '').substring(0, 100);
            const responsible = String(t.responsible || '').substring(0, 100);
            const startDate = String(t.startDate || '').substring(0, 50);
            const endDate = String(t.endDate || '').substring(0, 50);
            const priority = (allowedPriorities.includes(String(t.priority || ''))) 
                ? String(t.priority) 
                : 'media';
            const dateChangeStatus = (allowedDateChangeStatus.includes(String(t.dateChangeStatus || ''))) 
                ? String(t.dateChangeStatus) 
                : '';

            return [
                id,
                project,
                objective,
                content,
                columnId,
                sector,
                responsible,
                startDate,
                endDate,
                priority,
                dateChangeStatus
            ];
        });

        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.getRange(2, 1, lastRow - 1, 11).clearContent();
        }

        if (rows.length > 0) {
            sheet.getRange(2, 1, rows.length, 11).setValues(rows);
            SpreadsheetApp.flush();
        }

        return ContentService.createTextOutput(
            JSON.stringify({ status: 'success', count: data.tasks.length })
        ).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: 'Error processing data: ' + err.toString() })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

function setupSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear();
    sheet.appendRow(['id', 'project', 'objetivo', 'conteudo', 'status', 'setor', 'responsavel', 'data_inicio', 'data_fim', 'prioridade', 'dateChangeStatus']);
}
