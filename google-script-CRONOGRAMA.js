/**
 * FUNÇÕES ADICIONAIS PARA CRONOGRAMA
 * Adicione estas funções ao seu código do Google Apps Script existente
 * 
 * ESTRUTURA DA ABA "Cronograma":
 * - Colunas para Reuniões: data | titulo | hora | anotacoes
 * - Colunas para Eventos: data | nome | data_fim | is_end_event | is_folga | person | plantao_start_date
 * - Colunas para Plantões: data_inicio | data_fim | person
 */

// ============================================================================
// FUNÇÕES DE CRONOGRAMA
// ============================================================================

/**
 * Obter ou criar aba "Cronograma" na planilha
 */
function getCronogramaSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Cronograma');
    
    if (!sheet) {
        // Criar nova aba
        sheet = spreadsheet.insertSheet('Cronograma');
        
        // Criar cabeçalhos para Reuniões (linha 1)
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
            // Reuniões (colunas 0-3)
            if (row[0]) { // Se tem data
                const dateKey = formatDateKey(row[0]);
                if (!meetings[dateKey]) {
                    meetings[dateKey] = {
                        date: dateKey,
                        title: row[1] || '',
                        time: row[2] || '',
                        notes: row[3] || ''
                    };
                }
            }
            
            // Eventos (colunas 4-10)
            if (row[4]) { // Se tem data
                const dateKey = formatDateKey(row[4]);
                if (!events[dateKey]) {
                    events[dateKey] = {
                        date: dateKey,
                        name: row[5] || '',
                        endDate: row[6] || '',
                        isEndEvent: row[7] === true || row[7] === 'true',
                        isFolga: row[8] === true || row[8] === 'true',
                        person: row[9] || '',
                        plantaoStartDate: row[10] || '',
                        isEndPlantao: false // Adicionar se necessário
                    };
                }
            }
            
            // Plantões (colunas 11-13)
            if (row[11]) { // Se tem data_inicio
                const dateKey = formatDateKey(row[11]);
                if (!plantoes[dateKey]) {
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
        
        // Limpar dados antigos (exceto cabeçalho)
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
        }
        
        const meetings = data.meetings || {};
        const events = data.events || {};
        const plantoes = data.plantoes || {};
        
        const allRows = [];
        
        // Processar reuniões
        Object.keys(meetings).forEach(dateKey => {
            const meeting = meetings[dateKey];
            const row = [
                dateKey, // data
                meeting.title || '', // titulo
                meeting.time || '', // hora
                meeting.notes || '' // anotacoes
            ];
            // Preencher colunas de eventos e plantões com vazio
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
            // Dados do evento
            row.push(
                dateKey, // data
                event.name || '', // nome
                event.endDate || '', // data_fim
                event.isEndEvent || false, // is_end_event
                event.isFolga || false, // is_folga
                event.person || '', // person
                event.plantaoStartDate || '' // plantao_start_date
            );
            // Colunas vazias para plantões (3 colunas)
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
            // Dados do plantão
            row.push(
                dateKey, // data_inicio
                plantao.endDate || '', // data_fim
                plantao.person || '' // person
            );
            allRows.push(row);
        });
        
        // Escrever dados na planilha
        if (allRows.length > 0) {
            sheet.getRange(2, 1, allRows.length, 14).setValues(allRows);
        }
        
        return { success: true, message: 'Cronograma salvo com sucesso' };
        
    } catch (err) {
        console.error('Erro ao salvar cronograma:', err);
        throw err;
    }
}

/**
 * Formatar data para chave YYYY-MM-DD
 */
function formatDateKey(dateValue) {
    if (!dateValue) return '';
    
    let date;
    if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'string') {
        // Tentar parsear string de data
        date = new Date(dateValue);
    } else {
        return String(dateValue);
    }
    
    if (isNaN(date.getTime())) {
        return String(dateValue);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================================================
// ATUALIZAR doGet e doPost PARA INCLUIR CRONOGRAMA
// ============================================================================

/**
 * ATUALIZE SEU doGet EXISTENTE PARA INCLUIR:
 */
function doGet_CRONOGRAMA_UPDATE(e) {
    // ... código existente ...
    
    // Adicionar suporte para parâmetro ?action=cronograma
    const action = e.parameter.action;
    
    if (action === 'cronograma') {
        try {
            const cronograma = getCronograma();
            return createSuccessResponse(cronograma, 'Cronograma retrieved successfully');
        } catch (err) {
            return createErrorResponse('Erro ao buscar cronograma: ' + err.toString(), 500);
        }
    }
    
    // ... resto do código existente para buscar tarefas ...
}

/**
 * ATUALIZE SEU doPost EXISTENTE PARA INCLUIR:
 */
function doPost_CRONOGRAMA_UPDATE(e) {
    // ... código existente ...
    
    // Parse do JSON
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    if (action === 'cronograma') {
        try {
            const result = saveCronograma(requestData.data);
            return createSuccessResponse(result, 'Cronograma salvo com sucesso');
        } catch (err) {
            return createErrorResponse('Erro ao salvar cronograma: ' + err.toString(), 500);
        }
    }
    
    // ... resto do código existente para salvar tarefas ...
}







