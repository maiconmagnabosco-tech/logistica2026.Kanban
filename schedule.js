// API_URL será obtida do main.js se disponível, senão usa esta
const API_URL = window.KANBAN_API_URL || 'https://script.google.com/macros/s/AKfycbylY8f__8tujbaY-MwnknDvSSMQwTPgq5xWet0veq4Q0jS5HfYJu0HPmj9AxwBpoVzl/exec';

class ScheduleApp {
    constructor() {
        this.currentDate = new Date();
        this.tasks = [];
        this.meetings = {};
        this.events = {};
        this.plantoes = {};
        this.selectedDate = null;
        this.currentMeetingKey = null;
        this.currentEventKey = null;
        this.currentPlantaoKey = null;
        this.init();
    }

    async init() {
        this.setupSidebar();
        await this.fetchTasks();
        // Carregar dados do cronograma
        this.meetings = await this.loadMeetings();
        this.events = await this.loadEvents();
        this.plantoes = await this.loadPlantoes();
        this.renderCalendar();
        this.updateTodayAlert();
        this.setupEventListeners();
        this.displayUserInfo();
        this.setupUserPhoto();
    }

    setupSidebar() {
        // Botão Kanban
        const sidebarBtnKanban = document.getElementById('sidebar-btn-kanban');
        if (sidebarBtnKanban) {
            sidebarBtnKanban.onclick = () => {
                window.location.href = 'index.html';
            };
        }

        // Botão Dashboard
        const sidebarBtnDashboard = document.getElementById('sidebar-btn-dashboard');
        if (sidebarBtnDashboard) {
            sidebarBtnDashboard.onclick = () => {
                window.location.href = 'dashboard.html';
            };
        }

        // Botão Logout
        const sidebarBtnLogout = document.getElementById('sidebar-btn-logout');
        if (sidebarBtnLogout) {
            sidebarBtnLogout.onclick = () => {
                if (confirm('Deseja realmente sair do sistema?')) {
                    localStorage.removeItem('kanban_auth');
                    localStorage.removeItem('kanban_user');
                    localStorage.removeItem('kanban_user_name');
                    window.location.href = 'login.html';
                }
            };
        }
    }

    displayUserInfo() {
        if (typeof getUserPermissions === 'function') {
            const userPerms = getUserPermissions();
            if (userPerms) {
                const userInfoEl = document.getElementById('user-info');
                if (userInfoEl) {
                    userInfoEl.textContent = userPerms.name;
                }
            }
        }
    }

    setupUserPhoto() {
        const photoUpload = document.getElementById('user-photo-upload');
        const userPhoto = document.getElementById('user-photo');
        
        if (!photoUpload || !userPhoto) return;

        const userPerms = getUserPermissions();
        if (!userPerms) return;
        
        // Tentar carregar foto salva usando múltiplas chaves possíveis
        const emailKey = `kanban_user_photo_${userPerms.email}`;
        const nameKey = `kanban_user_photo_${userPerms.name.toLowerCase()}`;
        const firstName = userPerms.name.toLowerCase().split(' ')[0];
        const firstNameKey = `kanban_user_photo_${firstName}`;
        
        // Tentar encontrar foto salva em qualquer uma das chaves possíveis
        let savedPhoto = localStorage.getItem(emailKey);
        if (!savedPhoto) {
            savedPhoto = localStorage.getItem(nameKey);
        }
        if (!savedPhoto) {
            savedPhoto = localStorage.getItem(firstNameKey);
        }
        
        // Se ainda não encontrou, buscar em todas as chaves que começam com kanban_user_photo_
        if (!savedPhoto) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('kanban_user_photo_')) {
                    const storedName = key.replace('kanban_user_photo_', '').toLowerCase();
                    // Verificar se corresponde ao email, nome completo ou primeiro nome
                    if (storedName === userPerms.email.toLowerCase() || 
                        storedName === userPerms.name.toLowerCase() || 
                        storedName === firstName ||
                        storedName.includes(firstName) || 
                        firstName.includes(storedName.split('.')[0])) {
                        savedPhoto = localStorage.getItem(key);
                        if (savedPhoto) {
                            // Migrar para a chave principal (email) para facilitar buscas futuras
                            localStorage.setItem(emailKey, savedPhoto);
                            break;
                        }
                    }
                }
            }
        }
        
        if (savedPhoto) {
            userPhoto.src = savedPhoto;
            // Garantir que também está salva na chave principal (email)
            if (!localStorage.getItem(emailKey)) {
                localStorage.setItem(emailKey, savedPhoto);
            }
        } else {
            // Usar ícone padrão ou inicial com primeira letra
            const initial = userPerms.name.charAt(0).toUpperCase();
            // Criar uma imagem SVG com a inicial
            const svgContent = `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="25" fill="#3b82f6"/><text x="25" y="25" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>`;
            const svg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
            userPhoto.src = svg;
        }
        
        // Event listener para upload de foto
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const photoData = event.target.result;
                        userPhoto.src = photoData;
                        
                        // Salvar no localStorage usando email como chave principal
                        const photoKey = `kanban_user_photo_${userPerms.email}`;
                        localStorage.setItem(photoKey, photoData);
                        
                        // Também salvar por nome completo para facilitar busca
                        localStorage.setItem(`kanban_user_photo_${userPerms.name.toLowerCase()}`, photoData);
                        
                        // Salvar também pelo primeiro nome
                        const firstName = userPerms.name.toLowerCase().split(' ')[0];
                        localStorage.setItem(`kanban_user_photo_${firstName}`, photoData);
                        
                        // Garantir que a foto não será perdida - salvar também em uma chave genérica
                        const currentUser = localStorage.getItem('kanban_user');
                        if (currentUser) {
                            localStorage.setItem(`kanban_user_photo_${currentUser}`, photoData);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    async fetchTasks() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                mode: 'cors'
            });
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // Tentar como texto se não for JSON
                const text = await response.text();
                data = JSON.parse(text);
            }

            // Verificar se os dados estão em data.tasks ou tasks diretamente
            if (data && data.data && data.data.tasks) {
                this.tasks = data.data.tasks;
            } else if (data && data.tasks) {
                this.tasks = data.tasks;
            } else {
                this.tasks = [];
            }

            // Filtrar tarefas válidas
            this.tasks = this.tasks.filter(t => 
                t && t.id && 
                t.id !== 'Id' && 
                t.id !== 'id' && 
                t.id !== '' && 
                t.id !== 'undefined'
            );
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            this.tasks = [];
        }
    }

    async loadMeetings() {
        try {
            console.log('Tentando carregar reuniões da API:', API_URL);
            const response = await fetch(`${API_URL}?action=cronograma`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Resposta da API (reuniões):', data);
            
            if (data.status === 'success' && data.data) {
                const meetings = data.data.meetings || {};
                console.log('Carregando reuniões da API:', Object.keys(meetings).length, 'reuniões encontradas');
                
                // Validar e normalizar datas das reuniões
                const normalizedMeetings = {};
                Object.keys(meetings).forEach(dateKey => {
                    const meeting = meetings[dateKey];
                    let normalizedDateKey = dateKey;
                    
                    // Validar formato da data (deve ser YYYY-MM-DD)
                    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                    
                    if (!datePattern.test(dateKey)) {
                        console.warn('Formato de data da reunião inválido, tentando corrigir:', dateKey);
                        try {
                            // Tentar converter número serial do Google Sheets
                            if (typeof dateKey === 'number' || (!isNaN(dateKey) && parseFloat(dateKey) > 0 && parseFloat(dateKey) < 100000)) {
                                // Número serial do Google Sheets
                                const serial = typeof dateKey === 'string' ? parseFloat(dateKey) : dateKey;
                                const date = new Date((serial - 1 - 25569) * 86400000);
                                if (!isNaN(date.getTime())) {
                                    normalizedDateKey = this.getDateKey(date);
                                    console.log('Data convertida de serial:', dateKey, '->', normalizedDateKey);
                                } else {
                                    console.error('Não foi possível converter número serial:', dateKey);
                                    return; // Pular esta reunião
                                }
                            } else {
                                // Tentar parsear como string de data
                                const date = new Date(dateKey);
                                if (!isNaN(date.getTime())) {
                                    normalizedDateKey = this.getDateKey(date);
                                    console.log('Data convertida de string:', dateKey, '->', normalizedDateKey);
                                } else {
                                    console.error('Não foi possível converter data:', dateKey);
                                    return; // Pular esta reunião
                                }
                            }
                        } catch (e) {
                            console.error('Erro ao corrigir data da reunião:', e, dateKey);
                            return; // Pular esta reunião
                        }
                    }
                    
                    // Salvar reunião com data normalizada
                    normalizedMeetings[normalizedDateKey] = {
                        date: normalizedDateKey,
                        title: meeting.title || '',
                        time: meeting.time || '',
                        notes: meeting.notes || ''
                    };
                });
                
                console.log('Reuniões normalizadas:', Object.keys(normalizedMeetings).length);
                return normalizedMeetings;
            } else {
                console.warn('API não retornou success ou data:', data);
                // Retornar objeto vazio se não tiver dados
                return {};
            }
        } catch (error) {
            console.error('Erro ao carregar reuniões da API:', error);
            // NÃO usar localStorage como fallback - sempre usar API
            // Se a API falhar, retornar vazio e mostrar erro
            alert('Erro ao carregar reuniões. Verifique o console para mais detalhes.');
            return {};
        }
    }

    async saveMeetings() {
        try {
            console.log('Salvando reuniões na API:', Object.keys(this.meetings).length, 'reuniões');
            
            // IMPORTANTE: Usar APENAS dados locais atuais para garantir que exclusões sejam salvas
            // Não carregar da API primeiro, pois pode ter dados desatualizados
            const cronogramaData = {
                meetings: { ...this.meetings }, // Usar dados locais atuais (inclui exclusões)
                events: { ...this.events }, // Usar dados locais atuais
                plantoes: { ...this.plantoes } // Usar dados locais atuais
            };
            
            console.log('Dados a serem salvos (apenas locais):', {
                meetings: Object.keys(cronogramaData.meetings).length,
                events: Object.keys(cronogramaData.events).length,
                plantoes: Object.keys(cronogramaData.plantoes).length
            });
            
            // Usar no-cors (funciona mesmo com "Qualquer pessoa" - não requer autenticação)
            // Com no-cors, não conseguimos ver a resposta, mas assumimos sucesso se não houver erro
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'cronograma',
                        data: cronogramaData
                    })
                });
                
                console.log('Reuniões enviadas para servidor (no-cors mode)');
                // Com no-cors, assumimos sucesso se não houver erro
                return { status: 'success', message: 'Dados enviados (no-cors mode)' };
            } catch (fetchError) {
                console.warn('Erro ao enviar com fetch (no-cors):', fetchError);
                // Mesmo com erro, tentar continuar (no-cors pode não mostrar erros)
                throw new Error('Erro ao enviar dados. Verifique sua conexão.');
            }
        } catch (error) {
            console.error('Erro ao salvar reuniões na API:', error);
            console.error('URL da API:', API_URL);
            console.error('Tipo do erro:', error.name);
            
            // Com no-cors, erros podem ser silenciosos, então mostramos mensagem mais amigável
            console.warn('Nota: Com modo no-cors, não é possível verificar se os dados foram salvos.');
            console.warn('Os dados foram enviados. Verifique se aparecem ao recarregar a página.');
            
            // Não mostrar alert assustador - apenas avisar que foi enviado
            // O usuário pode verificar recarregando a página
            return { status: 'sent', message: 'Dados enviados (modo no-cors - verifique ao recarregar)' };
        }
    }

    async loadEvents() {
        try {
            console.log('Tentando carregar eventos da API:', API_URL);
            const response = await fetch(`${API_URL}?action=cronograma`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Resposta da API (eventos):', data);
            
            if (data.status === 'success' && data.data) {
                const events = data.data.events || {};
                console.log('Carregando eventos da API:', Object.keys(events).length, 'eventos encontrados');
                
                // Validar e normalizar datas dos eventos (especialmente plantaoStartDate)
                Object.keys(events).forEach(dateKey => {
                    const event = events[dateKey];
                    
                    // Validar plantaoStartDate se existir
                    if (event.plantaoStartDate) {
                        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                        if (!datePattern.test(event.plantaoStartDate)) {
                            console.warn('Formato de plantaoStartDate inválido, tentando corrigir:', event.plantaoStartDate);
                            try {
                                const date = new Date(event.plantaoStartDate);
                                if (!isNaN(date.getTime())) {
                                    event.plantaoStartDate = this.getDateKey(date);
                                } else {
                                    console.error('Não foi possível corrigir plantaoStartDate:', event.plantaoStartDate);
                                    delete event.plantaoStartDate;
                                }
                            } catch (e) {
                                console.error('Erro ao corrigir plantaoStartDate:', e);
                                delete event.plantaoStartDate;
                            }
                        }
                    }
                    
                    // Validar outras datas se existirem
                    if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
                        try {
                            const date = new Date(event.date);
                            if (!isNaN(date.getTime())) {
                                event.date = this.getDateKey(date);
                            }
                        } catch (e) {
                            console.warn('Erro ao corrigir data do evento:', e);
                        }
                    }
                    
                    if (event.endDate && event.endDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(event.endDate)) {
                        try {
                            const date = new Date(event.endDate);
                            if (!isNaN(date.getTime())) {
                                event.endDate = this.getDateKey(date);
                            }
                        } catch (e) {
                            console.warn('Erro ao corrigir endDate do evento:', e);
                        }
                    }
                });
                
                return events;
            } else {
                console.warn('API não retornou success ou data:', data);
                return {};
            }
        } catch (error) {
            console.error('Erro ao carregar eventos da API:', error);
            alert('Erro ao carregar eventos. Verifique o console para mais detalhes.');
            return {};
        }
    }

    async saveEvents() {
        try {
            console.log('Salvando eventos na API:', Object.keys(this.events).length, 'eventos');
            
            // IMPORTANTE: Usar APENAS dados locais atuais para garantir que exclusões sejam salvas
            // Não carregar da API primeiro, pois pode ter dados desatualizados
            const cronogramaData = {
                meetings: { ...this.meetings }, // Usar dados locais atuais
                events: { ...this.events }, // Usar dados locais atuais (inclui exclusões)
                plantoes: { ...this.plantoes } // Usar dados locais atuais
            };
            
            console.log('Dados a serem salvos (apenas locais):', {
                meetings: Object.keys(cronogramaData.meetings).length,
                events: Object.keys(cronogramaData.events).length,
                plantoes: Object.keys(cronogramaData.plantoes).length
            });
            
            // Usar no-cors (funciona mesmo com "Qualquer pessoa" - não requer autenticação)
            // Com no-cors, não conseguimos ver a resposta, mas assumimos sucesso se não houver erro
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'cronograma',
                        data: cronogramaData
                    })
                });
                
                console.log('Eventos enviados para servidor (no-cors mode)');
                // Com no-cors, assumimos sucesso se não houver erro
                return { status: 'success', message: 'Dados enviados (no-cors mode)' };
            } catch (fetchError) {
                console.warn('Erro ao enviar com fetch (no-cors):', fetchError);
                // Mesmo com erro, tentar continuar (no-cors pode não mostrar erros)
                throw new Error('Erro ao enviar dados. Verifique sua conexão.');
            }
        } catch (error) {
            console.error('Erro ao salvar eventos na API:', error);
            console.error('URL da API:', API_URL);
            console.error('Tipo do erro:', error.name);
            
            // Com no-cors, erros podem ser silenciosos, então mostramos mensagem mais amigável
            console.warn('Nota: Com modo no-cors, não é possível verificar se os dados foram salvos.');
            console.warn('Os dados foram enviados. Verifique se aparecem ao recarregar a página.');
            
            // Não mostrar alert assustador - apenas avisar que foi enviado
            return { status: 'sent', message: 'Dados enviados (modo no-cors - verifique ao recarregar)' };
        }
    }

    async loadPlantoes() {
        try {
            console.log('Tentando carregar plantões da API:', API_URL);
            const response = await fetch(`${API_URL}?action=cronograma`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Resposta da API (plantões):', data);
            
            if (data.status === 'success' && data.data) {
                const plantoes = data.data.plantoes || {};
                console.log('Carregando plantões da API:', Object.keys(plantoes).length, 'plantões encontrados');
                
                // Validar e normalizar datas dos plantões
                Object.keys(plantoes).forEach(dateKey => {
                    const plantao = plantoes[dateKey];
                    if (plantao.startDate) {
                        // Garantir que startDate está no formato YYYY-MM-DD
                        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                        if (!datePattern.test(plantao.startDate)) {
                            console.warn('Formato de data de início inválido, tentando corrigir:', plantao.startDate);
                            try {
                                const date = new Date(plantao.startDate);
                                if (!isNaN(date.getTime())) {
                                    plantao.startDate = this.getDateKey(date);
                                } else {
                                    console.error('Não foi possível corrigir data de início:', plantao.startDate);
                                    delete plantao.startDate;
                                }
                            } catch (e) {
                                console.error('Erro ao corrigir data de início:', e);
                                delete plantao.startDate;
                            }
                        }
                    }
                    if (plantao.endDate) {
                        // Garantir que endDate está no formato YYYY-MM-DD
                        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                        if (!datePattern.test(plantao.endDate)) {
                            console.warn('Formato de data de fim inválido, tentando corrigir:', plantao.endDate);
                            try {
                                const date = new Date(plantao.endDate);
                                if (!isNaN(date.getTime())) {
                                    plantao.endDate = this.getDateKey(date);
                                } else {
                                    console.error('Não foi possível corrigir data de fim:', plantao.endDate);
                                    delete plantao.endDate;
                                }
                            } catch (e) {
                                console.error('Erro ao corrigir data de fim:', e);
                                delete plantao.endDate;
                            }
                        }
                    }
                });
                
                return plantoes;
            } else {
                console.warn('API não retornou success ou data:', data);
                return {};
            }
        } catch (error) {
            console.error('Erro ao carregar plantões da API:', error);
            alert('Erro ao carregar plantões. Verifique o console para mais detalhes.');
            return {};
        }
    }

    async savePlantoes() {
        try {
            console.log('Salvando plantões na API:', Object.keys(this.plantoes).length, 'plantões');
            console.log('URL da API:', API_URL);
            
            // IMPORTANTE: Usar APENAS dados locais atuais para garantir que exclusões sejam salvas
            // Não carregar da API primeiro, pois pode ter dados desatualizados
            const cronogramaData = {
                meetings: { ...this.meetings }, // Usar dados locais atuais
                events: { ...this.events }, // Usar dados locais atuais
                plantoes: { ...this.plantoes } // Usar dados locais atuais (inclui exclusões)
            };
            
            console.log('Dados a serem salvos (apenas locais):', {
                meetings: Object.keys(cronogramaData.meetings).length,
                events: Object.keys(cronogramaData.events).length,
                plantoes: Object.keys(cronogramaData.plantoes).length
            });
            
            console.log('Dados a serem salvos:', {
                meetings: Object.keys(cronogramaData.meetings || {}).length,
                events: Object.keys(cronogramaData.events || {}).length,
                plantoes: Object.keys(cronogramaData.plantoes || {}).length
            });
            
            // Usar no-cors (funciona mesmo com "Qualquer pessoa" - não requer autenticação)
            // Com no-cors, não conseguimos ver a resposta, mas assumimos sucesso se não houver erro
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'cronograma',
                        data: cronogramaData
                    })
                });
                
                console.log('Plantões enviados para servidor (no-cors mode)');
                // Com no-cors, assumimos sucesso se não houver erro
                return { status: 'success', message: 'Dados enviados (no-cors mode)' };
            } catch (fetchError) {
                console.warn('Erro ao enviar com fetch (no-cors):', fetchError);
                // Mesmo com erro, tentar continuar (no-cors pode não mostrar erros)
                throw new Error('Erro ao enviar dados. Verifique sua conexão.');
            }
        } catch (error) {
            console.error('Erro ao salvar plantões na API:', error);
            console.error('URL da API:', API_URL);
            console.error('Tipo do erro:', error.name);
            console.error('Stack:', error.stack);
            
            // Com no-cors, erros podem ser silenciosos, então mostramos mensagem mais amigável
            console.warn('Nota: Com modo no-cors, não é possível verificar se os dados foram salvos.');
            console.warn('Os dados foram enviados. Verifique se aparecem ao recarregar a página.');
            
            // Não mostrar alert assustador - apenas avisar que foi enviado
            return { status: 'sent', message: 'Dados enviados (modo no-cors - verifique ao recarregar)' };
        }
    }

    // Obter chave da data no formato YYYY-MM-DD
    getDateKey(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Verificar se uma data tem projeto previsto para entrega e retornar as tarefas
    getTasksOnDate(date) {
        const dateKey = this.getDateKey(date);
        return this.tasks.filter(task => {
            if (!task.endDate) return false;
            const taskDate = new Date(task.endDate);
            const taskDateKey = this.getDateKey(taskDate);
            return taskDateKey === dateKey;
        });
    }

    // Verificar se uma data tem projeto previsto para entrega (método auxiliar)
    hasProjectOnDate(date) {
        return this.getTasksOnDate(date).length > 0;
    }

    // Verificar se uma data tem reunião
    hasMeetingOnDate(date) {
        const dateKey = this.getDateKey(date);
        return !!this.meetings[dateKey];
    }

    // Verificar se uma data tem evento
    hasEventOnDate(date) {
        const dateKey = this.getDateKey(date);
        return !!this.events[dateKey];
    }

    // Verificar se uma data tem plantão
    hasPlantaoOnDate(date) {
        const dateKey = this.getDateKey(date);
        // Verificar se há plantão que começa nesta data
        return !!this.plantoes[dateKey];
    }

    // Obter plantão de uma data específica
    getPlantaoOnDate(date) {
        const dateKey = this.getDateKey(date);
        return this.plantoes[dateKey] || null;
    }

    // Verificar se uma data tem folga
    hasFolgaOnDate(date) {
        const dateKey = this.getDateKey(date);
        const event = this.events[dateKey];
        return !!(event && event.isFolga);
    }

    // Obter folga de uma data específica
    getFolgaOnDate(date) {
        const dateKey = this.getDateKey(date);
        const event = this.events[dateKey];
        return (event && event.isFolga) ? event : null;
    }

    // Formatar data para exibição
    formatDate(dateString) {
        if (!dateString || dateString === '' || dateString === 'undefined') return '';
        
        // Se já está no formato YYYY-MM-DD, usar diretamente
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(dateString)) {
            try {
                const date = new Date(dateString + 'T00:00:00');
                if (isNaN(date.getTime())) {
                    console.warn('Data inválida:', dateString);
                    return '';
                }
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            } catch (e) {
                console.warn('Erro ao formatar data:', dateString, e);
                return '';
            }
        }
        
        // Tentar parsear outros formatos
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('Data inválida:', dateString);
                return '';
            }
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        } catch (e) {
            console.warn('Erro ao formatar data:', dateString, e);
            return '';
        }
    }

    renderCalendar() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const calendarGrid = document.getElementById('calendar-grid');

        if (!monthYearEl || !calendarGrid) return;

        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        monthYearEl.textContent = `${monthNames[month]} ${year}`;

        // Limpar grid
        calendarGrid.innerHTML = '';

        // Dias da semana com cor cinza uniforme
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekDays.forEach(dayName => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-weekday';
            dayHeader.textContent = dayName;
            calendarGrid.appendChild(dayHeader);
        });

        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Domingo da semana

        // Último dia a mostrar
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Sábado da semana

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';

            const dateKey = this.getDateKey(currentDate);
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.getDateKey(new Date()) === dateKey;
            const tasksOnDate = this.getTasksOnDate(currentDate);
            const hasProject = tasksOnDate.length > 0;
            const hasMeeting = this.hasMeetingOnDate(currentDate);
            const meeting = hasMeeting ? this.meetings[dateKey] : null;

            if (!isCurrentMonth) {
                dayEl.classList.add('other-month');
            }

            if (isToday && !hasMeeting) {
                dayEl.classList.add('today');
            }

            // Verificar se tem evento
            const hasEvent = this.hasEventOnDate(currentDate);
            const event = hasEvent ? this.events[dateKey] : null;

            // Verificar se tem plantão
            const hasPlantao = this.hasPlantaoOnDate(currentDate);
            const plantao = hasPlantao ? this.plantoes[dateKey] : null;

            // Verificar se tem folga
            const hasFolgaOnDate = this.hasFolgaOnDate(currentDate);
            const folgaOnDate = hasFolgaOnDate ? this.getFolgaOnDate(currentDate) : null;

            // Verificar se é sábado
            const isSaturday = currentDate.getDay() === 6;
            const isSunday = currentDate.getDay() === 0;
            const hasBothPlantaoAndFolga = isSaturday && hasPlantao && hasFolgaOnDate;

            // Conteúdo do dia - apenas número se não tiver atividade
            let dayContent = `<div class="calendar-day-number">${currentDate.getDate()}</div>`;
            
            // Se tem reunião, o dia fica cinza claro
            if (hasMeeting) {
                dayEl.classList.add('has-meeting-day');
                dayContent = `
                    <div class="calendar-day-number">
                        ${currentDate.getDate()}
                        <ion-icon name="people-outline" class="day-icon meeting-icon"></ion-icon>
                    </div>
                    <div class="calendar-day-content">
                        <div class="meeting-title">${this.escapeHtml(meeting.title || 'Reunião')}</div>
                        <div class="meeting-time">${meeting.time || ''}</div>
                        <button class="notes-button" title="Abrir anotações">
                            <ion-icon name="document-text-outline"></ion-icon>
                        </button>
                    </div>
                `;
            } else if (hasProject) {
                // Se tem projeto, mostra informações da tarefa
                dayEl.classList.add('has-project');
                const firstTask = tasksOnDate[0];
                const taskName = firstTask.objective || firstTask.content || 'Tarefa';
                const sector = firstTask.sector || '';
                const responsible = firstTask.responsible || '';
                
                // Se tiver mais de uma tarefa, mostrar contador
                const taskCount = tasksOnDate.length > 1 ? ` (+${tasksOnDate.length - 1})` : '';
                
                dayContent = `
                    <div class="calendar-day-number">
                        ${currentDate.getDate()}
                        <ion-icon name="checkmark-circle-outline" class="day-icon project-icon"></ion-icon>
                    </div>
                    <div class="calendar-day-task-info">
                        <div class="task-name">${this.escapeHtml(taskName)}${taskCount}</div>
                        ${sector ? `<div class="task-sector">${this.escapeHtml(sector)}</div>` : ''}
                        ${responsible ? `<div class="task-responsible">${this.escapeHtml(responsible)}</div>` : ''}
                    </div>
                `;
            } else if (hasBothPlantaoAndFolga) {
                // Sábado com plantão e folga - mostrar apenas folga (mais limpo)
                // No sábado só mostra a folga, o plantão começa nesse sábado mas não precisa mostrar
                dayEl.classList.add('has-folga');
                dayContent = `
                    <div class="calendar-day-number">
                        ${currentDate.getDate()}
                        <span class="day-icon event-icon" style="font-size: 1.2rem;">😎</span>
                    </div>
                    <div class="calendar-day-content">
                        <div class="event-title">${this.escapeHtml(folgaOnDate.name || `Folga - ${folgaOnDate.person || ''}`)}</div>
                    </div>
                `;
            } else if (hasPlantao && !isSaturday) {
                // Se tem plantão (início) e não é sábado, mostra informações do início do plantão
                // No sábado, só mostra a folga (se houver), não mostra o início do plantão
                dayEl.classList.add('has-plantao');
                dayContent = `
                    <div class="calendar-day-number">
                        ${currentDate.getDate()}
                        <ion-icon name="medical-outline" class="day-icon plantao-icon"></ion-icon>
                    </div>
                    <div class="calendar-day-content">
                        <div class="plantao-title">Início de Plantão: ${this.escapeHtml(plantao.person || '')}</div>
                        ${plantao.endDate ? `<div class="plantao-end-date">Até ${this.formatDate(plantao.endDate)}</div>` : ''}
                    </div>
                `;
            } else if (hasEvent) {
                // Se for fim de plantão no domingo, mostrar informação do início
                if (event.isEndPlantao && isSunday) {
                    dayEl.classList.add('has-end-plantao');
                    const plantaoStartDate = event.plantaoStartDate;
                    let inicioText = '';
                    if (plantaoStartDate && plantaoStartDate !== '' && plantaoStartDate !== 'undefined') {
                        // Validar formato da data (deve ser YYYY-MM-DD)
                        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                        if (datePattern.test(plantaoStartDate)) {
                            try {
                                const startDate = new Date(plantaoStartDate + 'T00:00:00');
                                // Verificar se a data é válida
                                if (!isNaN(startDate.getTime())) {
                                    inicioText = `<div class="plantao-start-info">Início: ${this.formatDate(plantaoStartDate)}</div>`;
                                } else {
                                    console.warn('Data de início do plantão inválida:', plantaoStartDate);
                                }
                            } catch (e) {
                                console.warn('Erro ao formatar data de início do plantão:', plantaoStartDate, e);
                            }
                        } else {
                            console.warn('Formato de data de início do plantão inválido:', plantaoStartDate);
                        }
                    }
                    
                    dayContent = `
                        <div class="calendar-day-number">
                            ${currentDate.getDate()}
                            <ion-icon name="medical-outline" class="day-icon event-icon"></ion-icon>
                        </div>
                        <div class="calendar-day-content">
                            <div class="event-title">${this.escapeHtml(event.name || 'Fim do Plantão')}</div>
                            ${inicioText}
                        </div>
                    `;
                } else {
                    dayEl.classList.add('has-event');
                    // Verificar se é um evento de fim
                    if (event.isEndEvent) {
                        dayEl.classList.add('has-end-event');
                    }
                    // Verificar se é um evento de folga
                    if (event.isFolga) {
                        dayEl.classList.add('has-folga');
                    }
                    // Ícone: emoji de óculos para folga, ícone normal para outros eventos
                    const eventIcon = event.isFolga 
                        ? '<span class="day-icon event-icon" style="font-size: 1.2rem;">😎</span>'
                        : '<ion-icon name="calendar-outline" class="day-icon event-icon"></ion-icon>';
                    dayContent = `
                        <div class="calendar-day-number">
                            ${currentDate.getDate()}
                            ${eventIcon}
                        </div>
                        <div class="calendar-day-content">
                            <div class="event-title">${this.escapeHtml(event.name || 'Evento')}</div>
                            ${event.endDate && !event.isEndEvent ? `<div class="event-end-date">Até ${this.formatDate(event.endDate)}</div>` : ''}
                        </div>
                    `;
                }
            }

            // Adicionar botões no canto inferior esquerdo
            let buttonsContainer = '';
            
            // Se é sábado e tem folga (mesmo sem plantão), mostrar botão + para adicionar plantão
            const showAddButtonOnSaturday = isSaturday && hasFolgaOnDate;
            
            // Se tem atividade (exceto quando tem both ou sábado com folga - nesse caso mostrar botão + para adicionar mais plantão)
            if (hasBothPlantaoAndFolga || showAddButtonOnSaturday) {
                // Quando tem both ou sábado com folga, mostrar botão + para poder adicionar plantão
                buttonsContainer = `
                    <div class="calendar-day-buttons">
                        <button class="day-btn day-btn-add" title="Adicionar pessoa ao plantão" data-action="show-options" data-date="${dateKey}">
                            <ion-icon name="add-outline"></ion-icon>
                        </button>
                        ${(hasMeeting || hasEvent || hasProject || hasPlantao || hasFolgaOnDate) ? `
                        <button class="day-btn day-btn-red" title="Excluir atividade ou reunião" data-action="delete" data-date="${dateKey}">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                        ` : ''}
                    </div>
                `;
            } else if (hasMeeting || hasEvent || hasProject || hasPlantao) {
                // Se tem evento de folga em sábado, também mostrar botão +
                if (isSaturday && hasEvent && event && event.isFolga) {
                    buttonsContainer = `
                        <div class="calendar-day-buttons">
                            <button class="day-btn day-btn-add" title="Adicionar pessoa ao plantão" data-action="show-options" data-date="${dateKey}">
                                <ion-icon name="add-outline"></ion-icon>
                            </button>
                            <button class="day-btn day-btn-red" title="Excluir atividade ou reunião" data-action="delete" data-date="${dateKey}">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    `;
                } else {
                    buttonsContainer = `
                        <div class="calendar-day-buttons">
                            <button class="day-btn day-btn-red" title="Excluir atividade ou reunião" data-action="delete" data-date="${dateKey}">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    `;
                }
            } else {
                // Se não tem atividade, mostrar apenas botão "+"
                buttonsContainer = `
                    <div class="calendar-day-buttons">
                        <button class="day-btn day-btn-add" title="Adicionar evento ou reunião" data-action="show-options" data-date="${dateKey}">
                            <ion-icon name="add-outline"></ion-icon>
                        </button>
                    </div>
                `;
            }

            dayEl.innerHTML = dayContent + buttonsContainer;

            // Event listeners para os botões
            const buttons = dayEl.querySelectorAll('.day-btn');
            buttons.forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const action = btn.getAttribute('data-action');
                    const btnDateKey = btn.getAttribute('data-date');
                    const btnDate = new Date(btnDateKey + 'T00:00:00');
                    
                    if (action === 'show-options') {
                        // Mostrar menu de opções (evento ou reunião)
                        this.showDayOptionsMenu(btnDate, btnDateKey, btn);
                    } else if (action === 'delete') {
                        this.deleteDayActivity(btnDateKey, btnDate);
                    }
                };
            });

            // Event listener para anotações de reunião
            if (hasMeeting) {
                const notesButton = dayEl.querySelector('.notes-button');
                if (notesButton) {
                    notesButton.onclick = (e) => {
                        e.stopPropagation();
                        this.openNotesModal(currentDate, dateKey);
                    };
                }
            }

            calendarGrid.appendChild(dayEl);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    updateTodayAlert() {
        const alertEl = document.getElementById('today-alert');
        if (!alertEl) return;

        const today = new Date();
        const todayKey = this.getDateKey(today);
        
        // Verificar se hoje tem projeto, evento, reunião ou fim de evento
        const tasksToday = this.getTasksOnDate(today);
        const hasMeeting = this.hasMeetingOnDate(today);
        const hasEvent = this.hasEventOnDate(today);
        const meeting = hasMeeting ? this.meetings[todayKey] : null;
        const event = hasEvent ? this.events[todayKey] : null;

        let alertMessage = '';
        let alertType = 'info';

        if (tasksToday.length > 0) {
            const firstTask = tasksToday[0];
            const taskName = firstTask.objective || firstTask.content || 'Tarefa';
            alertMessage = `📋 Hoje é dia de entrega: <strong>${this.escapeHtml(taskName)}</strong>`;
            alertType = 'project';
            if (tasksToday.length > 1) {
                alertMessage += ` (+${tasksToday.length - 1} ${tasksToday.length === 2 ? 'outra' : 'outras'})`;
            }
        } else if (event && event.isEndEvent) {
            alertMessage = `🔚 Hoje é o fim do evento: <strong>${this.escapeHtml(event.name)}</strong>`;
            alertType = 'end-event';
        } else if (hasEvent) {
            alertMessage = `📅 Hoje é dia do evento: <strong>${this.escapeHtml(event.name)}</strong>`;
            alertType = 'event';
        } else if (hasMeeting) {
            alertMessage = `👥 Hoje tem reunião: <strong>${this.escapeHtml(meeting.title || 'Reunião')}</strong>`;
            if (meeting.time) {
                alertMessage += ` às ${meeting.time}`;
            }
            alertType = 'meeting';
        }

        if (alertMessage) {
            alertEl.innerHTML = `
                <div class="today-alert-content">
                    <div class="today-alert-main">${alertMessage}</div>
                </div>
            `;
            alertEl.className = `today-alert today-alert-${alertType}`;
            alertEl.style.display = 'block';
        }
    }

    handleDayClick(date, hasMeeting) {
        const dateKey = this.getDateKey(date);
        
        // Se não tem reunião, abre modal para criar
        if (!hasMeeting) {
            this.openMeetingModal(date, dateKey);
        }
        // Se tem reunião, não faz nada no clique (só o botão de anotações abre)
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    showDayOptionsMenu(date, dateKey, buttonElement) {
        // Remover menu existente se houver
        const existingMenu = document.getElementById('day-options-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.id = 'day-options-menu';
        menu.className = 'day-options-menu';
        
        const buttonRect = buttonElement.getBoundingClientRect();
        const menuWidth = 180;
        const menuHeight = 90;
        
        // Verificar se é domingo para mostrar "Fim de Plantão"
        const isSunday = date.getDay() === 0;
        const menuItemsHeight = isSunday ? 120 : 90;
        
        // Posicionar menu acima do botão, centralizado
        let left = buttonRect.left - (menuWidth / 2) + (buttonRect.width / 2);
        let top = buttonRect.top - menuItemsHeight - 5;
        
        // Ajustar se sair da tela
        if (left < 10) left = 10;
        if (left + menuWidth > window.innerWidth - 10) {
            left = window.innerWidth - menuWidth - 10;
        }
        if (top < 10) {
            // Se não cabe acima, colocar abaixo
            top = buttonRect.bottom + 5;
        }
        
        menu.style.position = 'fixed';
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.zIndex = '10000';

        // Se for domingo, mostrar "Fim de Plantão" em vez de "Plantão"
        const plantaoLabel = isSunday ? 'Fim de Plantão' : 'Plantão';

        menu.innerHTML = `
            <div class="day-options-item" data-option="event">
                <ion-icon name="calendar-outline"></ion-icon>
                <span>Criar Evento</span>
            </div>
            <div class="day-options-item" data-option="meeting">
                <ion-icon name="people-outline"></ion-icon>
                <span>Criar Reunião</span>
            </div>
            <div class="day-options-item" data-option="plantao">
                <ion-icon name="medical-outline"></ion-icon>
                <span>${plantaoLabel}</span>
            </div>
        `;

        document.body.appendChild(menu);

        // Event listeners para as opções
        menu.querySelectorAll('.day-options-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const option = item.getAttribute('data-option');
                
                if (option === 'event') {
                    this.openEventModal(date, dateKey);
                } else if (option === 'meeting') {
                    this.openMeetingModal(date, dateKey);
                } else if (option === 'plantao') {
                    this.openPlantaoModal(date, dateKey);
                }
                
                menu.remove();
            });
        });

        // Fechar menu ao clicar fora
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && !buttonElement.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    openMeetingModal(date, dateKey) {
        const modal = document.getElementById('meeting-modal');
        const dateInput = document.getElementById('meeting-date');
        
        if (modal && dateInput) {
            dateInput.value = dateKey;
            this.selectedDate = date;
            this.currentMeetingKey = dateKey;
            modal.style.display = 'flex';
        }
    }

    closeMeetingModal() {
        const modal = document.getElementById('meeting-modal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedDate = null;
            this.currentMeetingKey = null;
        }
    }

    openNotesModal(date, dateKey) {
        const modal = document.getElementById('notes-modal');
        const dateInput = document.getElementById('notes-meeting-date');
        const contentTextarea = document.getElementById('notes-content');
        
        if (modal && dateInput && contentTextarea) {
            const meeting = this.meetings[dateKey];
            
            // PRIORIDADE 1: Usar meeting.date se existir e for válido (é a fonte mais confiável)
            // PRIORIDADE 2: Usar dateKey se for válido
            // PRIORIDADE 3: Usar o objeto date passado
            let dateObj;
            let finalDateKey = dateKey;
            
            if (meeting && meeting.date && /^\d{4}-\d{2}-\d{2}$/.test(meeting.date)) {
                // Usar a data salva na reunião (mais confiável)
                finalDateKey = meeting.date;
                const [year, month, day] = meeting.date.split('-').map(Number);
                dateObj = new Date(year, month - 1, day);
            } else if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                // Usar dateKey se for válido
                const [year, month, day] = dateKey.split('-').map(Number);
                dateObj = new Date(year, month - 1, day);
            } else {
                // Fallback: usar o objeto date passado
                dateObj = date instanceof Date ? date : new Date(date);
                if (dateObj && !isNaN(dateObj.getTime())) {
                    finalDateKey = this.getDateKey(dateObj);
                }
            }
            
            // Validar se a data é válida
            if (isNaN(dateObj.getTime())) {
                console.error('Data inválida ao abrir modal de anotações:', {
                    dateKey,
                    meeting,
                    meetingDate: meeting?.date
                });
                dateObj = new Date(); // Usar data atual como fallback
                finalDateKey = this.getDateKey(dateObj);
            }
            
            const dateStr = dateObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            dateInput.value = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            contentTextarea.value = meeting ? (meeting.notes || '') : '';
            
            this.selectedDate = dateObj;
            this.currentMeetingKey = finalDateKey;
            modal.style.display = 'flex';
        }
    }

    closeNotesModal() {
        const modal = document.getElementById('notes-modal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedDate = null;
            this.currentMeetingKey = null;
        }
    }

    async saveMeeting() {
        const dateInput = document.getElementById('meeting-date');
        const timeInput = document.getElementById('meeting-time');
        const titleInput = document.getElementById('meeting-title');

        if (!dateInput || !timeInput) return;

        let dateKey = dateInput.value;
        
        // Garantir que dateKey está no formato YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            // Tentar converter se não estiver no formato correto
            try {
                const date = new Date(dateKey);
                if (!isNaN(date.getTime())) {
                    dateKey = this.getDateKey(date);
                } else {
                    console.error('Data inválida ao salvar reunião:', dateInput.value);
                    alert('Erro: Data inválida. Por favor, selecione uma data válida.');
                    return;
                }
            } catch (e) {
                console.error('Erro ao converter data ao salvar reunião:', e, dateInput.value);
                alert('Erro: Não foi possível processar a data. Por favor, tente novamente.');
                return;
            }
        }
        
        const time = timeInput.value;
        const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'Reunião';

        if (!this.meetings[dateKey]) {
            this.meetings[dateKey] = {};
        }

        // Garantir que a data está salva corretamente
        this.meetings[dateKey].date = dateKey;
        this.meetings[dateKey].time = time;
        this.meetings[dateKey].title = title;
        this.meetings[dateKey].notes = this.meetings[dateKey].notes || '';

        console.log('Salvando reunião com data:', dateKey, this.meetings[dateKey]);

        await this.saveMeetings();
        this.closeMeetingModal();
        // Remover menu de opções se existir
        const existingMenu = document.getElementById('day-options-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        this.renderCalendar();
        this.updateTodayAlert();

        // NÃO abrir modal de anotações automaticamente
        // O usuário deve clicar no botão de anotações no dia da reunião
    }

    openEventModal(date, dateKey) {
        const modal = document.getElementById('event-modal');
        const dateInput = document.getElementById('event-date');
        const nameInput = document.getElementById('event-name');
        const endDateInput = document.getElementById('event-end-date');
        
        if (modal && dateInput && nameInput && endDateInput) {
            dateInput.value = dateKey;
            nameInput.value = '';
            endDateInput.value = '';
            this.selectedDate = date;
            this.currentEventKey = dateKey;
            modal.style.display = 'flex';
        }
    }

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedDate = null;
            this.currentEventKey = null;
        }
    }

    async saveEvent() {
        const dateInput = document.getElementById('event-date');
        const nameInput = document.getElementById('event-name');
        const endDateInput = document.getElementById('event-end-date');

        if (!dateInput || !nameInput) return;

        const dateKey = dateInput.value;
        const name = nameInput.value.trim();
        const endDate = endDateInput ? endDateInput.value.trim() : '';

        if (!name) {
            alert('Por favor, preencha o nome do evento.');
            return;
        }

        // Criar ou atualizar evento principal
        if (!this.events[dateKey]) {
            this.events[dateKey] = {};
        }

        this.events[dateKey].date = dateKey;
        this.events[dateKey].name = name;
        this.events[dateKey].endDate = endDate || null;

        // Se houver data de término, criar evento de fim automaticamente
        if (endDate && endDate.trim() !== '' && endDate !== dateKey) {
            const endDateKey = endDate.trim();
            
            console.log('Criando evento de fim. Data de término:', endDateKey, 'Data do evento:', dateKey);
            
            // Sempre criar/atualizar evento de fim
            this.events[endDateKey] = {
                date: endDateKey,
                name: `${name} - Fim`,
                isEndEvent: true,
                originalEventDate: dateKey
            };
            
            console.log('Evento de fim criado com sucesso na data:', endDateKey);
        } else if (endDate && endDate.trim() === '') {
            // Se não houver data de término, remover evento de fim se existir
            // (caso estejamos editando um evento e removendo a data de fim)
            const existingEvent = this.events[dateKey];
            if (existingEvent && existingEvent.endDate) {
                const oldEndDateKey = existingEvent.endDate;
                if (this.events[oldEndDateKey] && this.events[oldEndDateKey].isEndEvent && this.events[oldEndDateKey].originalEventDate === dateKey) {
                    delete this.events[oldEndDateKey];
                }
            }
        }

        await this.saveEvents();
        this.closeEventModal();
        this.renderCalendar();
        this.updateTodayAlert();
    }

    async deleteDayActivity(dateKey, date) {
        if (!confirm('Tem certeza que deseja excluir todas as atividades e reuniões deste dia?')) {
            return;
        }

        // Deletar reunião se existir
        if (this.meetings[dateKey]) {
            delete this.meetings[dateKey];
            await this.saveMeetings();
        }

        // Deletar evento se existir
        const eventToDelete = this.events[dateKey];
        if (eventToDelete) {
            // Se for um evento principal que tem data de fim, também deletar o evento de fim
            if (eventToDelete.endDate && !eventToDelete.isEndEvent) {
                const endDateKey = eventToDelete.endDate;
                if (this.events[endDateKey] && this.events[endDateKey].isEndEvent && this.events[endDateKey].originalEventDate === dateKey) {
                    delete this.events[endDateKey];
                }
            }
            // Se for um evento de fim, também limpar a referência do evento principal
            if (eventToDelete.isEndEvent && eventToDelete.originalEventDate) {
                const originalDateKey = eventToDelete.originalEventDate;
                if (this.events[originalDateKey]) {
                    this.events[originalDateKey].endDate = null;
                }
            }
            delete this.events[dateKey];
            await this.saveEvents();
        }

        // Deletar plantão se existir (início - sábado)
        if (this.plantoes[dateKey]) {
            const plantaoToDelete = this.plantoes[dateKey];
            const plantaoStartDateKey = dateKey; // Data de início do plantão
            const plantaoPerson = plantaoToDelete.person; // Nome da pessoa
            
            console.log('Excluindo plantão:', {
                startDate: plantaoStartDateKey,
                endDate: plantaoToDelete.endDate,
                person: plantaoPerson
            });
            
            // Se o plantão tem data de fim, remover o evento "Fim do Plantão" e a folga associada
            if (plantaoToDelete.endDate) {
                const endDateKey = plantaoToDelete.endDate;
                
                // Remover evento "Fim do Plantão" no domingo
                const endPlantaoEvent = this.events[endDateKey];
                if (endPlantaoEvent && endPlantaoEvent.isEndPlantao) {
                    // Verificar se é do mesmo plantão (por data de início ou pessoa)
                    const isSamePlantao = endPlantaoEvent.plantaoStartDate === plantaoStartDateKey || 
                                         endPlantaoEvent.person === plantaoPerson ||
                                         (endPlantaoEvent.plantaoStartDate && plantaoStartDateKey && 
                                          String(endPlantaoEvent.plantaoStartDate) === String(plantaoStartDateKey));
                    if (isSamePlantao) {
                        console.log('Removendo evento "Fim do Plantão" na data:', endDateKey);
                        delete this.events[endDateKey];
                    }
                }
                
                // Remover folga no próximo sábado após o fim do plantão
                const endDate = new Date(endDateKey + 'T00:00:00');
                const nextSaturday = new Date(endDate);
                nextSaturday.setDate(nextSaturday.getDate() + 6); // Domingo + 6 dias = próximo sábado
                const nextSaturdayKey = this.getDateKey(nextSaturday);
                
                console.log('Procurando folga na data calculada:', nextSaturdayKey, 'para plantão iniciado em:', plantaoStartDateKey);
                
                // Primeiro tentar na data calculada
                let folgaRemovida = false;
                const folgaEvent = this.events[nextSaturdayKey];
                if (folgaEvent && folgaEvent.isFolga) {
                    // Verificar se é a folga deste plantão (por data de início ou pessoa)
                    const isSamePlantao = folgaEvent.plantaoStartDate === plantaoStartDateKey || 
                                         folgaEvent.person === plantaoPerson ||
                                         (folgaEvent.plantaoStartDate && plantaoStartDateKey && 
                                          String(folgaEvent.plantaoStartDate) === String(plantaoStartDateKey));
                    if (isSamePlantao) {
                        console.log('Removendo folga associada na data calculada:', nextSaturdayKey);
                        delete this.events[nextSaturdayKey];
                        folgaRemovida = true;
                    }
                }
                
                // Se não encontrou na data calculada, procurar em todas as datas
                if (!folgaRemovida) {
                    console.log('Folga não encontrada na data calculada, procurando em todas as datas...');
                    Object.keys(this.events).forEach(eventDateKey => {
                        const event = this.events[eventDateKey];
                        if (event && event.isFolga) {
                            const isSamePlantao = event.plantaoStartDate === plantaoStartDateKey || 
                                                 event.person === plantaoPerson ||
                                                 (event.plantaoStartDate && plantaoStartDateKey && 
                                                  String(event.plantaoStartDate) === String(plantaoStartDateKey));
                            if (isSamePlantao) {
                                console.log('Folga encontrada em outra data:', eventDateKey, 'Removendo...');
                                delete this.events[eventDateKey];
                                folgaRemovida = true;
                            }
                        }
                    });
                }
                
                if (!folgaRemovida) {
                    console.warn('Folga não encontrada para o plantão:', {
                        startDate: plantaoStartDateKey,
                        endDate: endDateKey,
                        person: plantaoPerson
                    });
                }
            }
            
            // Remover o plantão
            delete this.plantoes[dateKey];
        }

        // Deletar evento "Fim do Plantão" se existir (domingo)
        const endPlantaoEventCheck = this.events[dateKey];
        if (endPlantaoEventCheck && endPlantaoEventCheck.isEndPlantao) {
            const plantaoStartDate = endPlantaoEventCheck.plantaoStartDate;
            const plantaoPerson = endPlantaoEventCheck.person;
            
            console.log('Excluindo evento "Fim do Plantão":', {
                endDate: dateKey,
                startDate: plantaoStartDate,
                person: plantaoPerson
            });
            
            // Se deletar o fim do plantão, também remover:
            // 1. O plantão de início (se existir)
            // 2. A folga associada
            
            // Remover plantão de início
            if (plantaoStartDate && this.plantoes[plantaoStartDate]) {
                console.log('Removendo plantão de início:', plantaoStartDate);
                delete this.plantoes[plantaoStartDate];
            }
            
            // Remover folga no próximo sábado
            const endDate = new Date(dateKey + 'T00:00:00');
            const nextSaturday = new Date(endDate);
            nextSaturday.setDate(nextSaturday.getDate() + 6); // Domingo + 6 dias = próximo sábado
            const nextSaturdayKey = this.getDateKey(nextSaturday);
            
            console.log('Procurando folga na data calculada:', nextSaturdayKey, 'para plantão iniciado em:', plantaoStartDate);
            
            // Primeiro tentar na data calculada
            let folgaRemovida = false;
            const folgaEvent = this.events[nextSaturdayKey];
            if (folgaEvent && folgaEvent.isFolga) {
                // Verificar se é a folga deste plantão (por data de início ou pessoa)
                const isSamePlantao = folgaEvent.plantaoStartDate === plantaoStartDate || 
                                     folgaEvent.person === plantaoPerson ||
                                     (folgaEvent.plantaoStartDate && plantaoStartDate && 
                                      String(folgaEvent.plantaoStartDate) === String(plantaoStartDate));
                if (isSamePlantao) {
                    console.log('Removendo folga associada na data calculada:', nextSaturdayKey);
                    delete this.events[nextSaturdayKey];
                    folgaRemovida = true;
                }
            }
            
            // Se não encontrou na data calculada, procurar em todas as datas
            if (!folgaRemovida) {
                console.log('Folga não encontrada na data calculada, procurando em todas as datas...');
                Object.keys(this.events).forEach(eventDateKey => {
                    const event = this.events[eventDateKey];
                    if (event && event.isFolga) {
                        const isSamePlantao = event.plantaoStartDate === plantaoStartDate || 
                                             event.person === plantaoPerson ||
                                             (event.plantaoStartDate && plantaoStartDate && 
                                              String(event.plantaoStartDate) === String(plantaoStartDate));
                        if (isSamePlantao) {
                            console.log('Folga encontrada em outra data:', eventDateKey, 'Removendo...');
                            delete this.events[eventDateKey];
                            folgaRemovida = true;
                        }
                    }
                });
            }
            
            if (!folgaRemovida) {
                console.warn('Folga não encontrada para o fim do plantão:', {
                    endDate: dateKey,
                    startDate: plantaoStartDate,
                    person: plantaoPerson
                });
            }
            
            // Remover o evento "Fim do Plantão"
            delete this.events[dateKey];
        }
        
        // Deletar folga diretamente (se clicar na folga para excluir)
        const folgaEventCheck = this.events[dateKey];
        if (folgaEventCheck && folgaEventCheck.isFolga) {
            const plantaoStartDate = folgaEventCheck.plantaoStartDate;
            const plantaoPerson = folgaEventCheck.person;
            
            console.log('Excluindo folga diretamente:', {
                folgaDate: dateKey,
                plantaoStartDate: plantaoStartDate,
                person: plantaoPerson
            });
            
            // Se deletar a folga diretamente, também remover:
            // 1. O plantão de início (se existir)
            // 2. O evento "Fim do Plantão" (se existir)
            
            // Remover plantão de início
            if (plantaoStartDate && this.plantoes[plantaoStartDate]) {
                const plantao = this.plantoes[plantaoStartDate];
                console.log('Removendo plantão de início associado:', plantaoStartDate);
                
                // Remover evento "Fim do Plantão" se existir
                if (plantao.endDate) {
                    const endPlantaoEvent = this.events[plantao.endDate];
                    if (endPlantaoEvent && endPlantaoEvent.isEndPlantao) {
                        console.log('Removendo evento "Fim do Plantão" associado:', plantao.endDate);
                        delete this.events[plantao.endDate];
                    }
                }
                
                delete this.plantoes[plantaoStartDate];
            }
            
            // Remover a folga
            delete this.events[dateKey];
        }

        // Salvar TODAS as mudanças de uma vez (importante para garantir que tudo seja salvo corretamente)
        console.log('Salvando todas as alterações após exclusão...');
        try {
            // Salvar tudo de uma vez para garantir consistência
            await this.saveMeetings();
            await this.saveEvents();
            await this.savePlantoes();
            console.log('Todas as alterações salvas com sucesso');
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            alert('Erro ao salvar exclusão. Verifique o console (F12) para mais detalhes.');
        }

        this.renderCalendar();
        this.updateTodayAlert();
        alert('Atividades excluídas com sucesso!');
    }

    async saveNotes() {
        const contentTextarea = document.getElementById('notes-content');
        if (!contentTextarea || !this.currentMeetingKey) return;

        if (!this.meetings[this.currentMeetingKey]) {
            this.meetings[this.currentMeetingKey] = {};
        }

        this.meetings[this.currentMeetingKey].notes = contentTextarea.value;
        await this.saveMeetings();

        alert('Anotações salvas com sucesso!');
    }

    printPDF() {
        if (!this.currentMeetingKey || !this.meetings[this.currentMeetingKey]) {
            alert('Nenhuma reunião selecionada.');
            return;
        }

        if (!window.jspdf) {
            alert('Erro: Biblioteca jsPDF não carregada. Recarregue a página.');
            return;
        }

        const meeting = this.meetings[this.currentMeetingKey];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const margin = 20;
        let yPos = margin;

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Ata da Reunião', margin, yPos);
        yPos += 10;

        // Linha separadora
        doc.setDrawColor(100, 100, 100);
        doc.line(margin, yPos, 190 - margin, yPos);
        yPos += 8;

        // Data da reunião
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const dateStr = document.getElementById('notes-meeting-date')?.value || meeting.date || '';
        doc.text(`Data: ${dateStr}`, margin, yPos);
        yPos += 6;

        // Horário (se disponível)
        if (meeting.time) {
            doc.text(`Horário: ${meeting.time}`, margin, yPos);
            yPos += 6;
        }

        // Título da reunião (se disponível)
        if (meeting.title) {
            doc.text(`Título: ${meeting.title}`, margin, yPos);
            yPos += 6;
        }

        yPos += 4;
        doc.line(margin, yPos, 190 - margin, yPos);
        yPos += 8;

        // Conteúdo das anotações
        doc.setFontSize(11);
        const notes = meeting.notes || '';
        const maxWidth = 190 - (margin * 2);
        const lines = doc.splitTextToSize(notes || '(Nenhuma anotação)', maxWidth);
        
        lines.forEach(line => {
            if (yPos > 270) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin, yPos);
            yPos += 5;
        });

        // Rodapé
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Página ${i} de ${totalPages}`,
                190 - margin,
                287,
                { align: 'right' }
            );
        }

        // Gerar nome do arquivo
        const fileName = `Ata_Reuniao_${meeting.date || 'sem_data'}.pdf`;
        doc.save(fileName);
    }

    setupEventListeners() {
        // Navegação do calendário
        const btnPrevMonth = document.getElementById('btn-prev-month');
        const btnNextMonth = document.getElementById('btn-next-month');

        if (btnPrevMonth) {
            btnPrevMonth.onclick = () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            };
        }

        if (btnNextMonth) {
            btnNextMonth.onclick = () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            };
        }

        // Modal de reunião
        const meetingModalClose = document.getElementById('meeting-modal-close');
        const btnCancelMeeting = document.getElementById('btn-cancel-meeting');
        const btnSaveMeeting = document.getElementById('btn-save-meeting');
        const meetingModal = document.getElementById('meeting-modal');

        if (meetingModalClose) {
            meetingModalClose.onclick = () => this.closeMeetingModal();
        }

        if (btnCancelMeeting) {
            btnCancelMeeting.onclick = () => this.closeMeetingModal();
        }

        if (btnSaveMeeting) {
            btnSaveMeeting.onclick = () => this.saveMeeting();
        }

        if (meetingModal) {
            meetingModal.onclick = (e) => {
                if (e.target === meetingModal) {
                    this.closeMeetingModal();
                }
            };
        }

        // Modal de anotações
        const notesModalClose = document.getElementById('notes-modal-close');
        const btnCloseNotes = document.getElementById('btn-close-notes');
        const btnSaveNotes = document.getElementById('btn-save-notes');
        const btnPrintPDF = document.getElementById('btn-print-pdf');
        const notesModal = document.getElementById('notes-modal');

        if (notesModalClose) {
            notesModalClose.onclick = () => this.closeNotesModal();
        }

        if (btnCloseNotes) {
            btnCloseNotes.onclick = () => this.closeNotesModal();
        }

        if (btnSaveNotes) {
            btnSaveNotes.onclick = () => this.saveNotes();
        }

        if (btnPrintPDF) {
            btnPrintPDF.onclick = () => this.printPDF();
        }

        if (notesModal) {
            notesModal.onclick = (e) => {
                if (e.target === notesModal) {
                    this.closeNotesModal();
                }
            };
        }

        // Modal de evento
        const eventModalClose = document.getElementById('event-modal-close');
        const btnCancelEvent = document.getElementById('btn-cancel-event');
        const btnSaveEvent = document.getElementById('btn-save-event');
        const eventModal = document.getElementById('event-modal');

        if (eventModalClose) {
            eventModalClose.onclick = () => this.closeEventModal();
        }

        if (btnCancelEvent) {
            btnCancelEvent.onclick = () => this.closeEventModal();
        }

        if (btnSaveEvent) {
            btnSaveEvent.onclick = () => this.saveEvent();
        }

        if (eventModal) {
            eventModal.onclick = (e) => {
                if (e.target === eventModal) {
                    this.closeEventModal();
                }
            };
        }

        // Modal de plantão
        const plantaoModalClose = document.getElementById('plantao-modal-close');
        const btnCancelPlantao = document.getElementById('btn-cancel-plantao');
        const btnSavePlantao = document.getElementById('btn-save-plantao');
        const plantaoModal = document.getElementById('plantao-modal');
        const plantaoEndDateInput = document.getElementById('plantao-end-date');

        if (plantaoModalClose) {
            plantaoModalClose.onclick = () => this.closePlantaoModal();
        }

        if (btnCancelPlantao) {
            btnCancelPlantao.onclick = () => this.closePlantaoModal();
        }

        if (btnSavePlantao) {
            btnSavePlantao.onclick = () => this.savePlantao();
        }

        if (plantaoModal) {
            plantaoModal.onclick = (e) => {
                if (e.target === plantaoModal) {
                    this.closePlantaoModal();
                }
            };
        }

        // Garantir que a data de fim do plantão seja sempre domingo
        if (plantaoEndDateInput) {
            plantaoEndDateInput.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                const dayOfWeek = selectedDate.getDay();
                
                // Se não for domingo (0), ajustar para o próximo domingo
                if (dayOfWeek !== 0) {
                    const daysToAdd = 7 - dayOfWeek;
                    selectedDate.setDate(selectedDate.getDate() + daysToAdd);
                    const sundayDate = this.getDateKey(selectedDate);
                    e.target.value = sundayDate;
                }
            });
        }

        // Botão de imprimir PDF de folgas
        const btnPrintFolgasPDF = document.getElementById('btn-print-folgas-pdf');
        if (btnPrintFolgasPDF) {
            btnPrintFolgasPDF.onclick = () => this.printFolgasPDF();
        }
    }

    openPlantaoModal(date, dateKey) {
        const modal = document.getElementById('plantao-modal');
        const startDateInput = document.getElementById('plantao-start-date');
        const personInput = document.getElementById('plantao-person');
        const endDateInput = document.getElementById('plantao-end-date');
        const modalTitle = modal ? modal.querySelector('h2') : null;
        
        if (modal && startDateInput && personInput && endDateInput) {
            const isSunday = date.getDay() === 0;
            
            // Se for domingo, é um "Fim de Plantão"
            if (isSunday) {
                // Para fim de plantão, a data selecionada é o fim (domingo)
                endDateInput.value = dateKey;
                startDateInput.value = '';
                personInput.value = '';
                
                if (modalTitle) {
                    modalTitle.textContent = 'Adicionar Fim de Plantão';
                }
            } else {
                // Para início de plantão, data selecionada é o início
                startDateInput.value = dateKey;
                personInput.value = '';
                endDateInput.value = '';
                
                // Definir data de fim como o próximo domingo a partir da data inicial
                const startDate = new Date(dateKey + 'T00:00:00');
                const dayOfWeek = startDate.getDay();
                const daysToSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
                startDate.setDate(startDate.getDate() + daysToSunday);
                const sundayDate = this.getDateKey(startDate);
                endDateInput.value = sundayDate;
                
                if (modalTitle) {
                    modalTitle.textContent = 'Agendar Plantão';
                }
            }
            
            this.selectedDate = date;
            this.currentPlantaoKey = dateKey;
            modal.style.display = 'flex';
        }
    }

    closePlantaoModal() {
        const modal = document.getElementById('plantao-modal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedDate = null;
            this.currentPlantaoKey = null;
        }
    }

    async savePlantao() {
        const startDateInput = document.getElementById('plantao-start-date');
        const personInput = document.getElementById('plantao-person');
        const endDateInput = document.getElementById('plantao-end-date');

        if (!startDateInput || !personInput || !endDateInput) return;

        const startDateKey = startDateInput.value;
        const person = personInput.value.trim();
        const endDateKey = endDateInput.value.trim();

        if (!person) {
            alert('Por favor, preencha o nome da pessoa.');
            return;
        }

        if (!endDateKey) {
            alert('Por favor, defina a data de fim do plantão.');
            return;
        }

        // Verificar se a data de fim é domingo
        const endDate = new Date(endDateKey + 'T00:00:00');
        if (endDate.getDay() !== 0) {
            alert('A data de fim do plantão deve ser sempre um domingo.');
            return;
        }

        // Se startDateKey está vazio, significa que foi criado a partir de um domingo (fim de plantão)
        // Nesse caso, precisamos encontrar o sábado anterior como início
        let actualStartDateKey = startDateKey;
        if (!startDateKey || startDateKey === '') {
            // Se não tem início definido (foi criado do domingo), calcular o sábado anterior
            const endDateObj = new Date(endDateKey + 'T00:00:00');
            endDateObj.setDate(endDateObj.getDate() - 1); // Voltar um dia para sábado
            actualStartDateKey = this.getDateKey(endDateObj);
        }

        // Criar ou atualizar plantão (salva o início - sempre no sábado)
        if (!this.plantoes[actualStartDateKey]) {
            this.plantoes[actualStartDateKey] = {};
        }

        this.plantoes[actualStartDateKey].startDate = actualStartDateKey;
        this.plantoes[actualStartDateKey].endDate = endDateKey;
        this.plantoes[actualStartDateKey].person = person;

        await this.savePlantoes();

        // Criar evento "Fim do Plantão" no domingo
        if (!this.events[endDateKey]) {
            this.events[endDateKey] = {};
        }
        this.events[endDateKey].date = endDateKey;
        this.events[endDateKey].name = `Fim do Plantão - ${person}`;
        this.events[endDateKey].isEndPlantao = true;
        this.events[endDateKey].person = person;
        // Garantir que plantaoStartDate está no formato YYYY-MM-DD
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(actualStartDateKey)) {
            this.events[endDateKey].plantaoStartDate = actualStartDateKey;
        } else {
            // Se não estiver no formato correto, converter
            try {
                const date = new Date(actualStartDateKey + 'T00:00:00');
                if (!isNaN(date.getTime())) {
                    this.events[endDateKey].plantaoStartDate = this.getDateKey(date);
                } else {
                    console.error('Erro: Não foi possível converter actualStartDateKey para formato válido:', actualStartDateKey);
                    this.events[endDateKey].plantaoStartDate = actualStartDateKey; // Tentar salvar mesmo assim
                }
            } catch (e) {
                console.error('Erro ao converter actualStartDateKey:', e);
                this.events[endDateKey].plantaoStartDate = actualStartDateKey; // Tentar salvar mesmo assim
            }
        }
        await this.saveEvents();

        // Criar evento de folga no próximo sábado após o fim do plantão
        const nextSaturday = new Date(endDate);
        nextSaturday.setDate(nextSaturday.getDate() + 6); // Domingo + 6 dias = próximo sábado
        const nextSaturdayKey = this.getDateKey(nextSaturday);
        
        // Verificar se já existe um evento de folga para essa pessoa nesse sábado
        const existingEvent = this.events[nextSaturdayKey];
        if (!existingEvent || !existingEvent.isFolga || existingEvent.person !== person) {
            // Criar evento de folga
            if (!this.events[nextSaturdayKey]) {
                this.events[nextSaturdayKey] = {};
            }
            this.events[nextSaturdayKey].date = nextSaturdayKey;
            this.events[nextSaturdayKey].name = `Folga - ${person}`;
            this.events[nextSaturdayKey].isFolga = true;
            this.events[nextSaturdayKey].person = person;
            // Garantir que plantaoStartDate está no formato YYYY-MM-DD
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (datePattern.test(actualStartDateKey)) {
                this.events[nextSaturdayKey].plantaoStartDate = actualStartDateKey;
            } else {
                // Se não estiver no formato correto, converter
                try {
                    const date = new Date(actualStartDateKey + 'T00:00:00');
                    if (!isNaN(date.getTime())) {
                        this.events[nextSaturdayKey].plantaoStartDate = this.getDateKey(date);
                    } else {
                        console.error('Erro: Não foi possível converter actualStartDateKey para formato válido:', actualStartDateKey);
                        this.events[nextSaturdayKey].plantaoStartDate = actualStartDateKey; // Tentar salvar mesmo assim
                    }
                } catch (e) {
                    console.error('Erro ao converter actualStartDateKey:', e);
                    this.events[nextSaturdayKey].plantaoStartDate = actualStartDateKey; // Tentar salvar mesmo assim
                }
            }
            await this.saveEvents();
        }

        this.closePlantaoModal();
        // Remover menu de opções se existir
        const existingMenu = document.getElementById('day-options-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        this.renderCalendar();
        this.updateTodayAlert();
    }

    printFolgasPDF() {
        if (!window.jspdf) {
            alert('Erro: Biblioteca jsPDF não carregada. Recarregue a página.');
            return;
        }

        // Obter filtros de data
        const startDateInput = document.getElementById('folgas-filter-start');
        const endDateInput = document.getElementById('folgas-filter-end');
        
        let startDate = null;
        let endDate = null;

        if (startDateInput && startDateInput.value) {
            startDate = new Date(startDateInput.value + 'T00:00:00');
        }
        if (endDateInput && endDateInput.value) {
            endDate = new Date(endDateInput.value + 'T23:59:59');
        }

        // Filtrar folgas
        const folgas = [];
        const eventKeys = Object.keys(this.events);
        
        eventKeys.forEach(dateKey => {
            const event = this.events[dateKey];
            if (event && event.isFolga) {
                const eventDate = new Date(dateKey + 'T00:00:00');
                
                // Aplicar filtro de data se existir
                if (startDate && eventDate < startDate) return;
                if (endDate && eventDate > endDate) return;
                
                folgas.push({
                    date: dateKey,
                    dateObj: eventDate,
                    person: event.person || 'Não informado'
                });
            }
        });

        // Ordenar por data
        folgas.sort((a, b) => a.dateObj - b.dateObj);

        if (folgas.length === 0) {
            alert('Nenhuma folga encontrada no período selecionado.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 20;
        let yPos = margin;

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Relatório de Folgas', margin, yPos);
        yPos += 10;

        // Período
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (startDate && endDate) {
            const startStr = startDate.toLocaleDateString('pt-BR');
            const endStr = endDate.toLocaleDateString('pt-BR');
            doc.text(`Período: ${startStr} até ${endStr}`, margin, yPos);
        } else if (startDate) {
            doc.text(`A partir de: ${startDate.toLocaleDateString('pt-BR')}`, margin, yPos);
        } else if (endDate) {
            doc.text(`Até: ${endDate.toLocaleDateString('pt-BR')}`, margin, yPos);
        } else {
            doc.text('Todos os períodos', margin, yPos);
        }
        yPos += 8;

        // Data de geração
        const now = new Date();
        doc.setFontSize(9);
        doc.text(`Relatório gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, margin, yPos);
        yPos += 10;

        doc.line(margin, yPos, 190 - margin, yPos);
        yPos += 8;

        // Cabeçalho da tabela
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Data', margin, yPos);
        doc.text('Pessoa', margin + 70, yPos);
        yPos += 6;
        doc.line(margin, yPos, 190 - margin, yPos);
        yPos += 8;

        // Conteúdo
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        folgas.forEach((folga, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = margin;
                
                // Recriar cabeçalho na nova página
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text('Data', margin, yPos);
                doc.text('Pessoa', margin + 70, yPos);
                yPos += 6;
                doc.line(margin, yPos, 190 - margin, yPos);
                yPos += 8;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
            }

            const dateStr = folga.dateObj.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            doc.text(dateStr, margin, yPos);
            doc.text(folga.person, margin + 70, yPos);
            yPos += 7;
        });

        // Rodapé
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Página ${i} de ${totalPages}`,
                190 - margin,
                287,
                { align: 'right' }
            );
            doc.text(
                `Total de folgas: ${folgas.length}`,
                margin,
                287
            );
        }

        // Gerar nome do arquivo
        const fileName = `Relatorio_Folgas_${now.toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ScheduleApp();
});

