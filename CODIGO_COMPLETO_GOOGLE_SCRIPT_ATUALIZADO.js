/**
 * API Google Apps Script - Kanban Logística MAGNABOSCO
 * Versão COMPLETA com suporte ao Cronograma
 * 
 * ESTRUTURA DA PLANILHA:
 * - Aba principal: id | project | objetivo | conteudo | status | setor | responsavel | data_inicio | data_fim | prioridade | dateChangeStatus
 * - Aba "Cronograma": Reuniões (cols 1-4) | Eventos (cols 5-11) | Plantões (cols 12-14)
 */

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

// Origens permitidas (domínios que podem acessar a API)
// IMPORTANTE: Para acesso público de qualquer origem, deixe vazio ou use '*'
// O Google Apps Script gerencia CORS automaticamente quando configurado como público
const ALLOWED_ORIGINS = [
    '*',  // Permite acesso de qualquer origem (público)
    'https://kanban-logistica-magnabosco.vercel.app',
    'https://*.vercel.app',
    'https://*.netlify.app',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:*',  // Qualquer porta local
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

// Nomes das colunas na planilha
const COLUMNS = [
    'id', 'project', 'objetivo', 'conteudo', 'status', 
    'setor', 'responsavel', 'data_inicio', 'data_fim', 
    'prioridade', 'dateChangeStatus'
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Criar resposta JSON com headers CORS
 */
function createResponse(data, statusCode = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    
    // Nota: Google Apps Script gerencia CORS automaticamente
    // Mas podemos adicionar validações de origem aqui se necessário
    
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
 * Validar origem da requisição (básico)
 * Nota: Google Apps Script gerencia CORS automaticamente quando público
 * Esta função é apenas para logging, não bloqueia requisições
 */
function isValidOrigin(origin) {
    // Se '*' está nas origens permitidas, sempre permitir
    if (ALLOWED_ORIGINS.includes('*')) {
        return true;
    }
    
    if (!origin) return true; // Se não tiver origem, permitir (para compatibilidade)
    
    return ALLOWED_ORIGINS.some(allowed => {
        if (allowed.includes('*')) {
            const pattern = allowed.replace(/\*/g, '.*');
            const regex = new RegExp('^' + pattern);
            return regex.test(origin);
        }
        return origin === allowed;
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
            
            // Se passou o tempo da janela, resetar contador
            if (timeDiff > RATE_LIMIT_WINDOW) {
                scriptProperties.setProperty(requestCountKey, '1');
                scriptProperties.setProperty(lastRequestKey, now.toString());
                return true;
            }
            
            // Verificar limite
            if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
                return false; // Rate limit excedido
            }
            
            // Incrementar contador
            scriptProperties.setProperty(requestCountKey, (requestCount + 1).toString());
        } else {
            // Primeira requisição
            scriptProperties.setProperty(lastRequestKey, now.toString());
            scriptProperties.setProperty(requestCountKey, '1');
        }
        
        return true;
    } catch (error) {
        // Em caso de erro, permitir (não bloquear por falha no rate limiting)
        console.error('Rate limit check failed:', error);
        return true;
    }
}

/**
 * Registrar log de acesso (salvar em sheet "Logs" se existir)
 */
function logAccess(action, method, success, error = null) {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let logSheet = spreadsheet.getSheetByName('Logs');
        
        // Criar sheet de logs se não existir
        if (!logSheet) {
            logSheet = spreadsheet.insertSheet('Logs');
            logSheet.getRange(1, 1, 1, 6).setValues([[
                'Data', 'Hora', 'Ação', 'Método', 'Sucesso', 'Erro'
            ]]);
            // Formatar cabeçalho
            const headerRange = logSheet.getRange(1, 1, 1, 6);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#4285f4');
            headerRange.setFontColor('#ffffff');
        }
        
        // Adicionar log
        const now = new Date();
        logSheet.appendRow([
            Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
            Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss'),
            action,
            method,
            success ? 'Sim' : 'Não',
            error || ''
        ]);
        
        // Limitar logs a 10000 linhas (manter apenas os últimos)
        const lastRow = logSheet.getLastRow();
        if (lastRow > 10000) {
            logSheet.deleteRows(2, lastRow - 10000);
        }
    } catch (error) {
        // Falha silenciosa - não bloquear operação por erro de log
        console.error('Log access failed:', error);
    }
}

/**
 * Sanitizar string (limitar tamanho e remover caracteres perigosos)
 */
function sanitizeString(value, maxLength = 1000) {
    if (value === null || value === undefined) return '';
    let str = String(value);
    
    // Remover caracteres de controle
    str = str.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Limitar tamanho
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
    
    // Validar e sanitizar cada campo
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
    
    // Validar que ID não está vazio
    if (!validated.id || validated.id === 'undefined') {
        throw new Error('Task ID is required and cannot be empty');
    }
    
    return validated;
}

/**
 * Inicializar planilha (criar cabeçalhos se não existir)
 */
function initializeSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    // Se a planilha está vazia ou não tem cabeçalhos, criar
    if (lastRow === 0) {
        sheet.appendRow(COLUMNS);
        // Formatar cabeçalho
        const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('#ffffff');
        sheet.setFrozenRows(1);
    } else {
        // Verificar se os cabeçalhos estão corretos
        const headers = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
        const headersMatch = headers.length === COLUMNS.length && 
                            headers.every((h, i) => String(h).toLowerCase() === COLUMNS[i].toLowerCase());
        
        if (!headersMatch) {
            // Adicionar cabeçalhos se não existirem corretamente
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
// FUNÇÕES DE CRONOGRAMA
// ============================================================================

/**
 * Formatar data para chave YYYY-MM-DD
 * Trata números seriais do Google Sheets (dias desde 1900-01-01)
 */
function formatDateKey(dateValue) {
    if (!dateValue) return '';
    
    // Se já está no formato YYYY-MM-DD, retornar direto
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }
    
    let date;
    if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'number' || (typeof dateValue === 'string' && !isNaN(dateValue) && parseFloat(dateValue) > 0 && parseFloat(dateValue) < 100000)) {
        // Número serial do Google Sheets (dias desde 1900-01-01)
        // Google Sheets considera 1900 como bissexto (bug histórico), então usamos -1
        const serial = typeof dateValue === 'string' ? parseFloat(dateValue) : dateValue;
        // Converter para JavaScript Date: (serial - 1 - 25569) * 86400000
        // 25569 = dias entre 1900-01-01 e 1970-01-01
        date = new Date((serial - 1 - 25569) * 86400000);
    } else if (typeof dateValue === 'string') {
        // Tentar parsear string de data
        date = new Date(dateValue);
    } else {
        return String(dateValue);
    }
    
    if (isNaN(date.getTime())) {
        console.warn('Não foi possível converter data:', dateValue);
        return String(dateValue);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obter ou criar aba "Cronograma" na planilha
 */
function getCronogramaSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Cronograma');
    
    if (!sheet) {
        // Criar nova aba
        sheet = spreadsheet.insertSheet('Cronograma');
        
        // Criar cabeçalhos para Reuniões (linha 1, colunas 1-4)
        sheet.getRange(1, 1, 1, 4).setValues([['data', 'titulo', 'hora', 'anotacoes']]);
        sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
        sheet.getRange(1, 1, 1, 4).setBackground('#4285f4');
        sheet.getRange(1, 1, 1, 4).setFontColor('#ffffff');
        
        // Criar cabeçalhos para Eventos (linha 1, colunas 5-11)
        sheet.getRange(1, 5, 1, 7).setValues([['data', 'nome', 'data_fim', 'is_end_event', 'is_folga', 'person', 'plantao_start_date']]);
        sheet.getRange(1, 5, 1, 7).setFontWeight('bold');
        sheet.getRange(1, 5, 1, 7).setBackground('#34a853');
        sheet.getRange(1, 5, 1, 7).setFontColor('#ffffff');
        
        // Criar cabeçalhos para Plantões (linha 1, colunas 12-14)
        sheet.getRange(1, 12, 1, 3).setValues([['data_inicio', 'data_fim', 'person']]);
        sheet.getRange(1, 12, 1, 3).setFontWeight('bold');
        sheet.getRange(1, 12, 1, 3).setBackground('#ea4335');
        sheet.getRange(1, 12, 1, 3).setFontColor('#ffffff');
        
        sheet.setFrozenRows(1);
    }
    
    return sheet;
}

/**
 * GET /cronograma - Buscar todos os dados do cronograma
 */
function getCronograma() {
    try {
        const sheet = getCronogramaSheet();
        const allData = sheet.getDataRange().getValues();
        
        // Se não houver dados (apenas cabeçalho)
        if (allData.length <= 1) {
            return {
                meetings: {},
                events: {},
                plantoes: {}
            };
        }
        
        // Remover cabeçalho
        const dataRows = allData.slice(1);
        
        const meetings = {};
        const events = {};
        const plantoes = {};
        
        // Processar linhas
        dataRows.forEach((row, index) => {
            // Reuniões (colunas 0-3, índice 0-3)
            if (row[0] && row[0] !== '') { // Se tem data
                const dateKey = formatDateKey(row[0]);
                if (dateKey && !meetings[dateKey]) {
                    meetings[dateKey] = {
                        date: dateKey,
                        title: row[1] || '',
                        time: row[2] || '',
                        notes: row[3] || ''
                    };
                }
            }
            
            // Eventos (colunas 4-10, índice 4-10)
            if (row[4] && row[4] !== '') { // Se tem data
                const dateKey = formatDateKey(row[4]);
                if (dateKey) {
                    // Sempre atualizar se já existe ou criar novo
                    events[dateKey] = {
                        date: dateKey,
                        name: row[5] || '',
                        endDate: row[6] || '',
                        isEndEvent: row[7] === true || row[7] === 'true' || String(row[7]).toLowerCase() === 'true',
                        isFolga: row[8] === true || row[8] === 'true' || String(row[8]).toLowerCase() === 'true',
                        person: row[9] || '',
                        plantaoStartDate: row[10] || '',
                        isEndPlantao: false
                    };
                    
                    // Verificar se é fim de plantão pelo nome
                    if (events[dateKey].name && events[dateKey].name.includes('Fim do Plantão')) {
                        events[dateKey].isEndPlantao = true;
                    }
                }
            }
            
            // Plantões (colunas 11-13, índice 11-13)
            if (row[11] && row[11] !== '') { // Se tem data_inicio
                const dateKey = formatDateKey(row[11]);
                if (dateKey && !plantoes[dateKey]) {
                    plantoes[dateKey] = {
                        startDate: dateKey,
                        endDate: row[12] ? formatDateKey(row[12]) : '',
                        person: row[13] || ''
                    };
                }
            }
        });
        
        return {
            meetings: meetings,
            events: events,
            plantoes: plantoes
        };
        
    } catch (err) {
        console.error('Erro ao buscar cronograma:', err);
        throw err;
    }
}

/**
 * POST /cronograma - Salvar todos os dados do cronograma
 */
function saveCronograma(data) {
    try {
        const sheet = getCronogramaSheet();
        
        // IMPORTANTE: Usar APENAS os dados recebidos do frontend
        // Não fazer merge com dados antigos - isso garante que exclusões sejam salvas corretamente
        // O frontend já envia todos os dados atualizados (incluindo exclusões)
        const meetings = data.meetings || {};
        const events = data.events || {};
        const plantoes = data.plantoes || {};
        
        // Log para debug
        console.log('Salvando cronograma (apenas dados recebidos):', {
            meetings: Object.keys(meetings).length,
            events: Object.keys(events).length,
            plantoes: Object.keys(plantoes).length,
            dadosRecebidos: {
                meetings: data.meetings ? Object.keys(data.meetings).length : 0,
                events: data.events ? Object.keys(data.events).length : 0,
                plantoes: data.plantoes ? Object.keys(data.plantoes).length : 0
            }
        });
        
        // Limpar dados antigos (exceto cabeçalho) apenas para reescrever tudo
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
        }
        
        const allRows = [];
        
        // Processar reuniões
        Object.keys(meetings).forEach(dateKey => {
            const meeting = meetings[dateKey];
            const row = [
                dateKey, // data (col 1)
                meeting.title || '', // titulo (col 2)
                meeting.time || '', // hora (col 3)
                meeting.notes || '' // anotacoes (col 4)
            ];
            // Preencher colunas de eventos e plantões com vazio (cols 5-14)
            for (let i = 0; i < 10; i++) {
                row.push('');
            }
            allRows.push(row);
        });
        
        // Processar eventos
        Object.keys(events).forEach(dateKey => {
            const event = events[dateKey];
            const row = [];
            // Colunas vazias para reuniões (4 colunas)
            for (let i = 0; i < 4; i++) {
                row.push('');
            }
            // Dados do evento (cols 5-11)
            row.push(
                dateKey, // data (col 5)
                event.name || '', // nome (col 6)
                event.endDate || '', // data_fim (col 7)
                event.isEndEvent || false, // is_end_event (col 8)
                event.isFolga || false, // is_folga (col 9)
                event.person || '', // person (col 10)
                event.plantaoStartDate || '' // plantao_start_date (col 11)
            );
            // Colunas vazias para plantões (3 colunas, cols 12-14)
            for (let i = 0; i < 3; i++) {
                row.push('');
            }
            allRows.push(row);
        });
        
        // Processar plantões
        Object.keys(plantoes).forEach(dateKey => {
            const plantao = plantoes[dateKey];
            const row = [];
            // Colunas vazias para reuniões (4 colunas)
            for (let i = 0; i < 4; i++) {
                row.push('');
            }
            // Colunas vazias para eventos (7 colunas)
            for (let i = 0; i < 7; i++) {
                row.push('');
            }
            // Dados do plantão (cols 12-14)
            row.push(
                dateKey, // data_inicio (col 12)
                plantao.endDate || '', // data_fim (col 13)
                plantao.person || '' // person (col 14)
            );
            allRows.push(row);
        });
        
        // Escrever dados na planilha
        if (allRows.length > 0) {
            sheet.getRange(2, 1, allRows.length, 14).setValues(allRows);
            SpreadsheetApp.flush(); // Forçar salvamento
        }
        
        return { success: true, message: 'Cronograma salvo com sucesso' };
        
    } catch (err) {
        console.error('Erro ao salvar cronograma:', err);
        throw err;
    }
}

// ============================================================================
// ENDPOINTS DA API
// ============================================================================

/**
 * GET - Buscar todas as tarefas OU cronograma
 */
function doGet(e) {
    const startTime = Date.now();
    let error = null;
    
    try {
        // Rate limiting
        if (!checkRateLimit()) {
            error = 'Rate limit exceeded. Please try again later.';
            logAccess('GET', 'GET', false, error);
            return createErrorResponse(error, 429);
        }
        
        // Verificar se é requisição de cronograma
        const action = e.parameter ? e.parameter.action : null;
        
        if (action === 'cronograma') {
            try {
                const cronograma = getCronograma();
                logAccess('GET cronograma', 'GET', true);
                return createSuccessResponse(cronograma, 'Cronograma retrieved successfully');
            } catch (err) {
                error = 'Erro ao buscar cronograma: ' + err.toString();
                console.error(error);
                logAccess('GET cronograma', 'GET', false, error);
                return createErrorResponse(error, 500);
            }
        }
        
        // Código existente para buscar tarefas
        // Inicializar planilha se necessário
        initializeSheet();
        
        // Buscar dados da planilha
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const rows = sheet.getDataRange().getValues();
        
        // Se não houver dados (apenas cabeçalho ou vazio)
        if (rows.length <= 1) {
            logAccess('GET', 'GET', true);
            return createSuccessResponse({ tasks: [] }, 'No tasks found');
        }
        
        // Remover cabeçalho (primeira linha)
        const dataRows = rows.slice(1);
        
        // Mapear para objetos de tarefas
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
 * POST - Salvar tarefas OU cronograma
 */
function doPost(e) {
    const startTime = Date.now();
    let error = null;
    
    try {
        // Rate limiting
        if (!checkRateLimit()) {
            error = 'Rate limit exceeded. Please try again later.';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 429);
        }
        
        // Validar payload
        if (!e.postData || !e.postData.contents) {
            error = 'No data provided';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        // Validar tamanho do payload
        const payloadSize = e.postData.contents.length;
        if (payloadSize > MAX_PAYLOAD_SIZE) {
            error = `Payload too large (max ${MAX_PAYLOAD_SIZE} bytes)`;
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 413);
        }
        
        // Parse JSON
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            error = 'Invalid JSON format';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        // Verificar se é requisição de cronograma
        const action = data.action;
        
        if (action === 'cronograma') {
            try {
                if (!data.data) {
                    error = 'Data field is required for cronograma';
                    logAccess('POST cronograma', 'POST', false, error);
                    return createErrorResponse(error, 400);
                }
                
                const result = saveCronograma(data.data);
                logAccess('POST cronograma', 'POST', true);
                return createSuccessResponse(result, 'Cronograma salvo com sucesso');
            } catch (err) {
                error = 'Erro ao salvar cronograma: ' + err.toString();
                console.error(error);
                logAccess('POST cronograma', 'POST', false, error);
                return createErrorResponse(error, 500);
            }
        }
        
        // Código existente para salvar tarefas
        // Validar estrutura
        if (!data || !Array.isArray(data.tasks)) {
            error = 'Invalid data structure: tasks array is required';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        // Validar número de tarefas
        if (data.tasks.length > MAX_TASKS) {
            error = `Too many tasks (max ${MAX_TASKS})`;
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        // Inicializar planilha
        initializeSheet();
        
        // Validar e sanitizar todas as tarefas
        const validatedTasks = [];
        for (let i = 0; i < data.tasks.length; i++) {
            try {
                const validated = validateAndSanitizeTask(data.tasks[i]);
                validatedTasks.push(validated);
            } catch (validationError) {
                console.error(`Validation error for task ${i}:`, validationError);
                // Pular tarefa inválida, mas continuar processamento
            }
        }
        
        if (validatedTasks.length === 0) {
            error = 'No valid tasks to save';
            logAccess('POST', 'POST', false, error);
            return createErrorResponse(error, 400);
        }
        
        // Converter para formato de linhas da planilha
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
        
        // Escrever na planilha
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const lastRow = sheet.getLastRow();
        
        // Limpar dados antigos (manter cabeçalho)
        if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
        }
        
        // Inserir novos dados
        if (rows.length > 0) {
            sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
            SpreadsheetApp.flush(); // Forçar salvamento
        }
        
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
 * Função auxiliar para configurar a planilha inicial (executar manualmente se necessário)
 */
function setupSheet() {
    initializeSheet();
    return 'Sheet initialized successfully';
}

/**
 * Função para testar a API localmente
 */
function testAPI() {
    console.log('Testing GET...');
    const getResult = doGet({});
    console.log('GET result:', getResult.getContent());
    
    console.log('\nTesting POST...');
    const testData = {
        tasks: [
            {
                id: 'test-1',
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
    
    const postResult = doPost({
        postData: {
            contents: JSON.stringify(testData)
        }
    });
    console.log('POST result:', postResult.getContent());
}

