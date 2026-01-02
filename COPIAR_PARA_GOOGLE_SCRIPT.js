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
    // Google Apps Script com ContentService gerencia CORS automaticamente
    // quando implantado como Web App público
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
        const props = PropertiesService.getScriptProperties();
        const now = Date.now();
        const lastRequest = parseInt(props.getProperty('LAST_REQUEST_TIME') || '0');
        const requestCount = parseInt(props.getProperty('REQUEST_COUNT') || '0');
        
        // Se passou mais de RATE_LIMIT_WINDOW, resetar contador
        if (now - lastRequest > RATE_LIMIT_WINDOW) {
            props.setProperty('LAST_REQUEST_TIME', now.toString());
            props.setProperty('REQUEST_COUNT', '1');
            return true;
        }
        
        // Se não excedeu o limite, incrementar contador
        if (requestCount < MAX_REQUESTS_PER_WINDOW) {
            props.setProperty('REQUEST_COUNT', (requestCount + 1).toString());
            return true;
        }
        
        // Excedeu o limite
        return false;
    } catch (err) {
        // Em caso de erro, permitir requisição
        return true;
    }
}

/**
 * Log de acesso (opcional, para debug)
 */
function logAccess(endpoint, method, success, error = null) {
    try {
        const log = {
            timestamp: new Date().toISOString(),
            endpoint: endpoint,
            method: method,
            success: success,
            error: error
        };
        console.log(JSON.stringify(log));
    } catch (err) {
        // Ignorar erros de log
    }
}

/**
 * Validar e sanitizar uma tarefa
 */
function validateAndSanitizeTask(task) {
    // Validar campos obrigatórios
    if (!task.id || typeof task.id !== 'string') {
        throw new Error('ID da tarefa é obrigatório e deve ser string');
    }
    
    // Validar columnId
    if (!ALLOWED_COLUMN_IDS.includes(task.columnId)) {
        throw new Error(`columnId inválido: ${task.columnId}`);
    }
    
    // Validar prioridade
    if (task.priority && !ALLOWED_PRIORITIES.includes(task.priority)) {
        throw new Error(`Prioridade inválida: ${task.priority}`);
    }
    
    // Validar dateChangeStatus
    if (task.dateChangeStatus && !ALLOWED_DATE_CHANGE_STATUS.includes(task.dateChangeStatus)) {
        throw new Error(`dateChangeStatus inválido: ${task.dateChangeStatus}`);
    }
    
    // Sanitizar strings (remover caracteres perigosos)
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[<>]/g, '').trim();
    };
    
    return {
        id: sanitize(task.id),
        project: sanitize(task.project || ''),
        objective: sanitize(task.objective || ''),
        content: sanitize(task.content || ''),
        columnId: task.columnId,
        sector: sanitize(task.sector || ''),
        responsible: sanitize(task.responsible || ''),
        startDate: sanitize(task.startDate || ''),
        endDate: sanitize(task.endDate || ''),
        priority: task.priority || 'media',
        dateChangeStatus: task.dateChangeStatus || ''
    };
}

/**
 * Inicializar planilha com cabeçalhos
 */
function initializeSheet() {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getActiveSheet();
        
        // Se a planilha estiver vazia ou não tiver cabeçalhos, criar
        if (sheet.getLastRow() === 0) {
            sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
            sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
        } else {
            // Verificar se os cabeçalhos estão corretos
            const headers = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
            const headersMatch = headers.every((header, index) => header === COLUMNS[index]);
            
            if (!headersMatch) {
                // Atualizar cabeçalhos se necessário
                sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
                sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
            }
        }
        
        return sheet;
    } catch (err) {
        console.error('Erro ao inicializar planilha:', err);
        throw err;
    }
}

// ============================================================================
// FUNÇÕES DO CRONOGRAMA
// ============================================================================

/**
 * Obter ou criar a aba "Cronograma"
 */
function getCronogramaSheet() {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getSheetByName('Cronograma');
        
        if (!sheet) {
            // Criar aba "Cronograma" se não existir
            sheet = spreadsheet.insertSheet('Cronograma');
            
            // Criar cabeçalho
            // Colunas: data (reuniões) | titulo | hora | anotacoes | data (eventos) | nome | data_fim | is_end_event | is_folga | person | plantao_start_date | data_inicio (plantões) | data_fim (plantões) | person (plantões)
            const headers = [
                'data',           // col 1 - reuniões
                'titulo',         // col 2 - reuniões
                'hora',           // col 3 - reuniões
                'anotacoes',      // col 4 - reuniões
                'data',           // col 5 - eventos
                'nome',           // col 6 - eventos
                'data_fim',       // col 7 - eventos
                'is_end_event',   // col 8 - eventos
                'is_folga',       // col 9 - eventos
                'person',         // col 10 - eventos
                'plantao_start_date', // col 11 - eventos
                'data_inicio',    // col 12 - plantões
                'data_fim',       // col 13 - plantões
                'person'          // col 14 - plantões
            ];
            
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        }
        
        return sheet;
    } catch (err) {
        console.error('Erro ao obter/criar aba Cronograma:', err);
        throw err;
    }
}

/**
 * Formatar data para chave (YYYY-MM-DD)
 */
function formatDateKey(dateValue) {
    if (!dateValue) return null;
    
    try {
        let date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string') {
            // Tentar parsear string de data
            date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                return null;
            }
        } else {
            return null;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (err) {
        console.error('Erro ao formatar data:', err);
        return null;
    }
}

/**
 * GET /cronograma - Buscar todos os dados do cronograma
 */
function getCronograma() {
    try {
        const sheet = getCronogramaSheet();
        const allData = sheet.getDataRange().getValues();
        
        // Se não houver dados (apenas cabeçalho ou vazio)
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
        
        // IMPORTANTE: NÃO apagar dados antigos - fazer merge inteligente
        // Carregar dados existentes primeiro
        let existingData;
        try {
            existingData = getCronograma();
        } catch (err) {
            console.error('Erro ao carregar dados existentes, usando dados recebidos:', err);
            existingData = { meetings: {}, events: {}, plantoes: {} };
        }
        
        // Fazer merge: dados novos sobrescrevem existentes, mas preserva o que não foi enviado
        // Se data.meetings estiver vazio, preservar existentes
        const meetings = (data.meetings && Object.keys(data.meetings).length > 0) 
            ? Object.assign({}, existingData.meetings || {}, data.meetings || {})
            : (existingData.meetings || {});
        
        // Se data.events estiver vazio, preservar existentes
        const events = (data.events && Object.keys(data.events).length > 0)
            ? Object.assign({}, existingData.events || {}, data.events || {})
            : (existingData.events || {});
        
        // Se data.plantoes estiver vazio, preservar existentes
        const plantoes = (data.plantoes && Object.keys(data.plantoes).length > 0)
            ? Object.assign({}, existingData.plantoes || {}, data.plantoes || {})
            : (existingData.plantoes || {});
        
        // Log para debug
        console.log('Salvando cronograma:', {
            meetings: Object.keys(meetings).length,
            events: Object.keys(events).length,
            plantoes: Object.keys(plantoes).length,
            dadosRecebidos: {
                meetings: data.meetings ? Object.keys(data.meetings).length : 0,
                events: data.events ? Object.keys(data.events).length : 0,
                plantoes: data.plantoes ? Object.keys(data.plantoes).length : 0
            },
            dadosExistentes: {
                meetings: existingData.meetings ? Object.keys(existingData.meetings).length : 0,
                events: existingData.events ? Object.keys(existingData.events).length : 0,
                plantoes: existingData.plantoes ? Object.keys(existingData.plantoes).length : 0
            }
        });
        
        // VALIDAÇÃO DE SEGURANÇA: Não apagar se não tiver dados para escrever
        const totalDados = Object.keys(meetings).length + Object.keys(events).length + Object.keys(plantoes).length;
        const totalExistentes = Object.keys(existingData.meetings || {}).length + 
                                Object.keys(existingData.events || {}).length + 
                                Object.keys(existingData.plantoes || {}).length;
        
        // Se está tentando apagar dados mas não tem nada para escrever, NÃO APAGAR
        if (totalDados === 0 && totalExistentes > 0) {
            console.warn('Tentativa de apagar dados sem ter nada para escrever. Abortando salvamento.');
            return { 
                success: false, 
                message: 'Erro: Tentativa de apagar dados sem conteúdo. Dados preservados.' 
            };
        }
        
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



