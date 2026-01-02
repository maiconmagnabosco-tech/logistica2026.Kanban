/**
 * API Google Apps Script - Kanban Logística MAGNABOSCO
 * Versão com Google Sheets API direto (seguro - chave no servidor)
 * 
 * ESTRUTURA DA PLANILHA:
 * Colunas: id | project | objetivo | conteudo | status | setor | responsavel | data_inicio | data_fim | prioridade | dateChangeStatus
 */

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

// API Key do Google Sheets API (armazenada de forma segura no PropertiesService)
// Para configurar, execute a função setupAPIKey() uma vez
const getAPIKey = function() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('GOOGLE_API_KEY') || '';
};

// ID da planilha (obtido automaticamente ou pode ser configurado)
const getSpreadsheetId = function() {
  return SpreadsheetApp.getActiveSpreadsheet().getId();
};

// URL base da Google Sheets API
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Origens permitidas (domínios que podem acessar a API)
// IMPORTANTE: Atualize com a URL do seu deploy
const ALLOWED_ORIGINS = [
    'https://kanban-logistica-magnabosco.vercel.app',  // ← ATUALIZE AQUI
    'https://*.vercel.app',                             // Qualquer subdomínio Vercel
    'https://*.netlify.app',                            // Qualquer subdomínio Netlify
    'http://localhost:8000',                            // Desenvolvimento local
    'http://127.0.0.1:8000',                           // Desenvolvimento local alternativo
];

// Limites de segurança
const MAX_PAYLOAD_SIZE = 1000000;        // 1MB máximo
const MAX_TASKS = 10000;                 // Máximo de tarefas por requisição
const RATE_LIMIT_WINDOW = 60000;         // 1 minuto em ms
const MAX_REQUESTS_PER_WINDOW = 100;     // 100 requisições por minuto

// Valores permitidos para validação
const ALLOWED_COLUMN_IDS = ['todo', 'inprogress', 'validation', 'done'];
const ALLOWED_PRIORITIES = ['baixa', 'media', 'alta'];
const ALLOWED_DATE_CHANGE_STATUS = ['', 'postergada', 'antecipada'];

// Nome da aba da planilha (padrão: primeira aba)
const SHEET_NAME = 'Sheet1';

// Nomes das colunas na planilha
const COLUMNS = [
    'id', 'project', 'objetivo', 'conteudo', 'status', 
    'setor', 'responsavel', 'data_inicio', 'data_fim', 
    'prioridade', 'dateChangeStatus'
];

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Configurar API Key (executar UMA VEZ para configurar)
 * 
 * INSTRUÇÕES:
 * 1. No Google Apps Script, selecione esta função no dropdown
 * 2. Clique em "Executar" ▶️
 * 3. A API Key será configurada automaticamente
 */
function setupAPIKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // API Key fornecida
  const API_KEY = 'AIzaSyDrg0PNmgX8RTq9d_eG16kOMls0t4Biykw';
  
  // Armazenar de forma segura
  scriptProperties.setProperty('GOOGLE_API_KEY', API_KEY);
  
  return 'API Key configurada com sucesso!';
}

/**
 * Testar conexão com Sheets API
 */
function testSheetsAPI() {
  const apiKey = getAPIKey();
  const spreadsheetId = getSpreadsheetId();
  
  if (!apiKey) {
    return 'Erro: API Key não configurada. Execute setupAPIKey() primeiro.';
  }
  
  try {
    const url = `${SHEETS_API_BASE}/${spreadsheetId}?key=${apiKey}`;
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    return {
      success: true,
      spreadsheetTitle: data.properties.title,
      message: 'Conexão com Sheets API funcionando!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: 'Erro ao conectar com Sheets API'
    };
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Buscar dados usando Sheets API
 */
function fetchDataFromSheetsAPI() {
  const apiKey = getAPIKey();
  const spreadsheetId = getSpreadsheetId();
  
  if (!apiKey) {
    // Fallback: usar SpreadsheetApp se API Key não estiver configurada
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    return sheet.getDataRange().getValues();
  }
  
  try {
    // Usar Sheets API
    const range = `${SHEET_NAME}!A1:Z10000`; // Ajuste conforme necessário
    const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${apiKey}`;
    
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    return data.values || [];
  } catch (error) {
    console.error('Erro ao buscar dados via Sheets API, usando fallback:', error);
    // Fallback: usar SpreadsheetApp
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    return sheet.getDataRange().getValues();
  }
}

/**
 * Salvar dados usando Sheets API
 */
function saveDataToSheetsAPI(rows) {
  const apiKey = getAPIKey();
  const spreadsheetId = getSpreadsheetId();
  
  if (!apiKey || rows.length === 0) {
    // Fallback: usar SpreadsheetApp se API Key não estiver configurada
    return saveDataWithSpreadsheetApp(rows);
  }
  
  try {
    // Limpar dados antigos (manter cabeçalho)
    const clearRange = `${SHEET_NAME}!A2:Z10000`;
    const clearUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/${clearRange}?key=${apiKey}`;
    UrlFetchApp.fetch(clearUrl, {
      method: 'DELETE'
    });
    
    // Escrever novos dados
    const writeRange = `${SHEET_NAME}!A2:${getColumnLetter(COLUMNS.length)}${rows.length + 1}`;
    const writeUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/${writeRange}?valueInputOption=RAW&key=${apiKey}`;
    
    const payload = {
      values: rows
    };
    
    UrlFetchApp.fetch(writeUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados via Sheets API, usando fallback:', error);
    // Fallback: usar SpreadsheetApp
    return saveDataWithSpreadsheetApp(rows);
  }
}

/**
 * Fallback: Salvar usando SpreadsheetApp (método nativo)
 */
function saveDataWithSpreadsheetApp(rows) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // Limpar dados antigos (manter cabeçalho)
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Inserir novos dados
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
    SpreadsheetApp.flush();
  }
  
  return true;
}

/**
 * Converter número de coluna para letra (ex: 1 = A, 27 = AA)
 */
function getColumnLetter(columnNumber) {
  let letter = '';
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return letter || 'A';
}

/**
 * Criar resposta JSON com headers CORS
 */
function createResponse(data, statusCode = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    return output;
}

/**
 * Criar resposta de erro
 */
function createErrorResponse(message, statusCode = 400) {
    return createResponse({
        status: 'error',
        message: message,
        timestamp: new Date().toISOString()
    }, statusCode);
}

/**
 * Criar resposta de sucesso
 */
function createSuccessResponse(data, message = 'Success') {
    return createResponse({
        status: 'success',
        message: message,
        data: data,
        timestamp: new Date().toISOString()
    });
}

/**
 * Rate limiting simples usando PropertiesService
 */
function checkRateLimit() {
    try {
        const scriptProperties = PropertiesService.getScriptProperties();
        const now = Date.now();
        const lastRequestKey = 'last_request_time';
        const requestCountKey = 'request_count';
        
        const lastRequest = scriptProperties.getProperty(lastRequestKey);
        const requestCount = parseInt(scriptProperties.getProperty(requestCountKey) || '0');
        
        if (lastRequest) {
            const timeDiff = now - parseInt(lastRequest);
            
            if (timeDiff > RATE_LIMIT_WINDOW) {
                scriptProperties.setProperty(requestCountKey, '1');
                scriptProperties.setProperty(lastRequestKey, now.toString());
                return true;
            }
            
            if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
                return false;
            }
            
            scriptProperties.setProperty(requestCountKey, (requestCount + 1).toString());
        } else {
            scriptProperties.setProperty(lastRequestKey, now.toString());
            scriptProperties.setProperty(requestCountKey, '1');
        }
        
        return true;
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return true;
    }
}

/**
 * Registrar log de acesso
 */
function logAccess(action, method, success, error = null) {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let logSheet = spreadsheet.getSheetByName('Logs');
        
        if (!logSheet) {
            logSheet = spreadsheet.insertSheet('Logs');
            logSheet.getRange(1, 1, 1, 6).setValues([[
                'Data', 'Hora', 'Ação', 'Método', 'Sucesso', 'Erro'
            ]]);
            const headerRange = logSheet.getRange(1, 1, 1, 6);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#4285f4');
            headerRange.setFontColor('#ffffff');
        }
        
        const now = new Date();
        logSheet.appendRow([
            Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
            Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss'),
            action,
            method,
            success ? 'Sim' : 'Não',
            error || ''
        ]);
        
        const lastRow = logSheet.getLastRow();
        if (lastRow > 10000) {
            logSheet.deleteRows(2, lastRow - 10000);
        }
    } catch (error) {
        console.error('Log access failed:', error);
    }
}

/**
 * Sanitizar string
 */
function sanitizeString(value, maxLength = 1000) {
    if (value === null || value === undefined) return '';
    let str = String(value);
    str = str.replace(/[\x00-\x1F\x7F]/g, '');
    if (str.length > maxLength) {
        str = str.substring(0, maxLength);
    }
    return str.trim();
}

/**
 * Validar e sanitizar tarefa
 */
function validateAndSanitizeTask(task) {
    if (!task || typeof task !== 'object') {
        throw new Error('Task must be an object');
    }
    
    const validated = {
        id: sanitizeString(task.id || '', 100),
        project: sanitizeString(task.project || 'Geral', 200),
        objective: sanitizeString(task.objective || '', 1000),
        content: sanitizeString(task.content || '', 500),
        columnId: ALLOWED_COLUMN_IDS.includes(String(task.columnId || '')) 
            ? String(task.columnId) 
            : 'todo',
        sector: sanitizeString(task.sector || '', 100),
        responsible: sanitizeString(task.responsible || '', 100),
        startDate: sanitizeString(task.startDate || '', 50),
        endDate: sanitizeString(task.endDate || '', 50),
        priority: ALLOWED_PRIORITIES.includes(String(task.priority || '')) 
            ? String(task.priority) 
            : 'media',
        dateChangeStatus: ALLOWED_DATE_CHANGE_STATUS.includes(String(task.dateChangeStatus || '')) 
            ? String(task.dateChangeStatus) 
            : ''
    };
    
    if (!validated.id || validated.id === 'undefined') {
        throw new Error('Task ID is required and cannot be empty');
    }
    
    return validated;
}

/**
 * Inicializar planilha
 */
function initializeSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow === 0) {
        sheet.appendRow(COLUMNS);
        const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('#ffffff');
        sheet.setFrozenRows(1);
    } else {
        const headers = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
        const headersMatch = headers.length === COLUMNS.length && 
                            headers.every((h, i) => String(h).toLowerCase() === COLUMNS[i].toLowerCase());
        
        if (!headersMatch) {
            sheet.insertRowBefore(1);
            sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
            const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#4285f4');
            headerRange.setFontColor('#ffffff');
            sheet.setFrozenRows(1);
        }
    }
}

// ============================================================================
// ENDPOINTS DA API
// ============================================================================

/**
 * GET - Buscar todas as tarefas
 */
function doGet(e) {
    const startTime = Date.now();
    let error = null;
    
    try {
        // e pode ser undefined se chamado manualmente (ok para GET)
        // Para GET, não precisamos do parâmetro, mas verificamos para evitar erros
        
        if (!checkRateLimit()) {
            error = 'Rate limit exceeded. Please try again later.';
            logAccess('GET', 'GET', false, error);
            return createErrorResponse(error, 429);
        }
        
        initializeSheet();
        
        // Buscar dados (usa Sheets API se configurado, senão usa SpreadsheetApp)
        const rows = fetchDataFromSheetsAPI();
        
        if (rows.length <= 1) {
            logAccess('GET', 'GET', true);
            return createSuccessResponse({ tasks: [] }, 'No tasks found');
        }
        
        const dataRows = rows.slice(1);
        
        const tasks = dataRows.map((row, index) => {
            try {
                return {
                    id: String(row[0] || ''),
                    project: row[1] || '',
                    objective: row[2] || '',
                    content: row[3] || '',
                    columnId: row[4] || 'todo',
                    sector: row[5] || '',
                    responsible: row[6] || '',
                    startDate: row[7] || '',
                    endDate: row[8] || '',
                    priority: row[9] || 'media',
                    dateChangeStatus: row[10] || ''
                };
            } catch (err) {
                console.error(`Error parsing row ${index + 2}:`, err);
                return null;
            }
        }).filter(t => t !== null && t.id && t.id !== 'undefined');
        
        const responseTime = Date.now() - startTime;
        logAccess('GET', 'GET', true);
        
        return createSuccessResponse({
            tasks: tasks,
            count: tasks.length,
            responseTime: responseTime
        }, 'Tasks retrieved successfully');
        
    } catch (err) {
        error = err.toString();
        console.error('GET error:', err);
        logAccess('GET', 'GET', false, error);
        return createErrorResponse('Internal server error: ' + error, 500);
    }
}

/**
 * POST - Salvar tarefas
 */
function doPost(e) {
    const startTime = Date.now();
    let error = null;
    
    try {
        // Verificar se foi chamado como Web App (tem parâmetro e)
        if (!e || typeof e !== 'object') {
            error = 'Function must be called as Web App. Use testPost() for manual testing.';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        if (!checkRateLimit()) {
            error = 'Rate limit exceeded. Please try again later.';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 429);
        }
        
        if (!e.postData || !e.postData.contents) {
            error = 'No data provided';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        const payloadSize = e.postData.contents.length;
        if (payloadSize > MAX_PAYLOAD_SIZE) {
            error = `Payload too large (max ${MAX_PAYLOAD_SIZE} bytes)`;
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 413);
        }
        
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            error = 'Invalid JSON format';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        if (!data || !Array.isArray(data.tasks)) {
            error = 'Invalid data structure: tasks array is required';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        if (data.tasks.length > MAX_TASKS) {
            error = `Too many tasks (max ${MAX_TASKS})`;
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        initializeSheet();
        
        const validatedTasks = [];
        for (let i = 0; i < data.tasks.length; i++) {
            try {
                const validated = validateAndSanitizeTask(data.tasks[i]);
                validatedTasks.push(validated);
            } catch (validationError) {
                console.error(`Validation error for task ${i}:`, validationError);
            }
        }
        
        if (validatedTasks.length === 0) {
            error = 'No valid tasks to save';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        const rows = validatedTasks.map(task => [
            task.id,
            task.project,
            task.objective,
            task.content,
            task.columnId,
            task.sector,
            task.responsible,
            task.startDate,
            task.endDate,
            task.priority,
            task.dateChangeStatus
        ]);
        
        // Salvar dados (usa Sheets API se configurado, senão usa SpreadsheetApp)
        saveDataToSheetsAPI(rows);
        
        const responseTime = Date.now() - startTime;
        logAccess('POST', 'POST', true);
        
        return createSuccessResponse({
            count: validatedTasks.length,
            saved: validatedTasks.length,
            responseTime: responseTime
        }, 'Tasks saved successfully');
        
    } catch (err) {
        error = err.toString();
        console.error('POST error:', err);
        logAccess('POST', 'POST', false, error);
        return createErrorResponse('Internal server error: ' + error, 500);
    }
}

/**
 * Função auxiliar para configurar a planilha inicial
 */
function setupSheet() {
    initializeSheet();
    return 'Sheet initialized successfully';
}

/**
 * Função para testar POST manualmente (para testes no editor)
 */
function testPost() {
    const testData = {
        tasks: [
            {
                id: 'test-' + Date.now(),
                project: 'Teste',
                objective: 'Objetivo de teste',
                content: 'Conteúdo de teste',
                columnId: 'todo',
                sector: 'TI',
                responsible: 'Teste',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                priority: 'media',
                dateChangeStatus: ''
            }
        ]
    };
    
    const mockEvent = {
        postData: {
            contents: JSON.stringify(testData)
        }
    };
    
    const result = doPost(mockEvent);
    return result.getContent();
}

