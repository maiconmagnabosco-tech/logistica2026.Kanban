// API_URL será obtida do main.js se disponível, senão usa esta
const API_URL = 'https://script.google.com/macros/s/AKfycbzups-xiV57iFmlV1OYzi3Fp6_qOtZ3DOl1sJPp38dwMGsHjioNIF3UIiE_PI-vKUVu/exec';
// Disponibilizar API_URL globalmente para outros scripts
if (typeof window !== 'undefined') {
    window.KANBAN_API_URL = API_URL;
}

// Função auxiliar para escapar HTML e prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

const COLUMNS = [
    { id: 'todo', title: 'Não Iniciado', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }, // Vermelho
    { id: 'inprogress', title: 'Em Andamento', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }, // Laranja
    { id: 'validation', title: 'Validação', color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }, // Cinza
    { id: 'done', title: 'Concluído', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } // Verde
];

class App {
    constructor() {
        this.tasks = [];
        this.currentProject = localStorage.getItem('kanban_filter_project') || '';
        this.currentResponsible = localStorage.getItem('kanban_filter_responsible') || '';
        this.currentSector = localStorage.getItem('kanban_filter_sector') || '';
        this.isSyncing = false;
        this.originalEndDate = null; // Para comparar datas na edição
        this.originalTaskId = null; // Para comparar datas na edição
        this.init();
    }

    async init() {
        this.setupModal();
        this.setupFilters();
        this.displayUserInfo();
        this.setupUserPhoto();
        await this.fetchData();

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        let sidebarOverlay = document.getElementById('sidebar-overlay');
        
        // Criar overlay se não existir
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.id = 'sidebar-overlay';
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
            
            // Fechar sidebar ao clicar no overlay
            sidebarOverlay.addEventListener('click', () => {
                if (sidebar) {
                    sidebar.classList.remove('sidebar-open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        }
        
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar-open');
                sidebarOverlay.classList.toggle('active');
            });
        }

        // Botão fechar sidebar no mobile
        const mobileCloseBtn = document.getElementById('mobile-close-sidebar');
        if (mobileCloseBtn && sidebar) {
            mobileCloseBtn.addEventListener('click', () => {
                sidebar.classList.remove('sidebar-open');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Fechar sidebar ao clicar em qualquer botão do sidebar no mobile
        const sidebarButtons = document.querySelectorAll('.sidebar-btn');
        sidebarButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('sidebar-open');
                    if (sidebarOverlay) {
                        sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });

        // Botão "Novo Projeto" no sidebar
        const sidebarBtnNewProject = document.getElementById('sidebar-btn-new-project');
        if (sidebarBtnNewProject) {
            if (canCreateCard()) {
                sidebarBtnNewProject.onclick = () => {
                    this.openModal();
                };
            } else {
                sidebarBtnNewProject.style.display = 'none';
            }
        }

        // Botão Dashboard no sidebar
        const sidebarBtnDashboard = document.getElementById('sidebar-btn-dashboard');
        if (sidebarBtnDashboard) {
            sidebarBtnDashboard.onclick = async () => {
                // Garantir que os dados sejam salvos antes de navegar
                // Com no-cors não podemos verificar se salvou, mas enviamos os dados
                this.sync();
                // Aguardar um tempo para garantir que a requisição foi enviada
                await new Promise(resolve => setTimeout(resolve, 800));
                window.location.href = 'dashboard.html';
            };
        }

        // Botão Cronograma no sidebar
        const sidebarBtnSchedule = document.getElementById('sidebar-btn-schedule');
        if (sidebarBtnSchedule) {
            sidebarBtnSchedule.onclick = async () => {
                // Garantir que os dados sejam salvos antes de navegar
                this.sync();
                await new Promise(resolve => setTimeout(resolve, 800));
                window.location.href = 'schedule.html';
            };
        }

        // Botão Sair do Sistema no sidebar
        const sidebarBtnLogout = document.getElementById('sidebar-btn-logout');
        if (sidebarBtnLogout) {
            sidebarBtnLogout.onclick = () => {
            if (confirm('Deseja realmente sair do sistema?')) {
                    // NÃO remover fotos ao fazer logout - elas devem persistir para o próximo login
                localStorage.removeItem('kanban_auth');
                localStorage.removeItem('kanban_user');
                    localStorage.removeItem('kanban_user_name');
                    // Limpar filtros também
                    localStorage.removeItem('kanban_filter_project');
                    localStorage.removeItem('kanban_filter_responsible');
                    localStorage.removeItem('kanban_filter_sector');
                window.location.href = 'login.html';
            }
        };
        }
    }

    displayUserInfo() {
        const userPerms = getUserPermissions();
        if (userPerms) {
            const userInfoEl = document.getElementById('user-info');
            if (userInfoEl) {
                userInfoEl.textContent = userPerms.name;
            }
        }
    }
    
    setupUserPhoto() {
        const photoUpload = document.getElementById('user-photo-upload');
        const userPhoto = document.getElementById('user-photo');
        
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
                        
                        // Salvar no localStorage usando email como chave principal (PERSISTENTE)
                        const photoKey = `kanban_user_photo_${userPerms.email}`;
                        localStorage.setItem(photoKey, photoData);
                        
                        // Também salvar por nome completo para facilitar busca (PERSISTENTE)
                        localStorage.setItem(`kanban_user_photo_${userPerms.name.toLowerCase()}`, photoData);
                        
                        // Salvar também pelo primeiro nome (PERSISTENTE)
                        const firstName = userPerms.name.toLowerCase().split(' ')[0];
                        localStorage.setItem(`kanban_user_photo_${firstName}`, photoData);
                        
                        // Salvar também na chave genérica do usuário atual (PERSISTENTE)
                        // A foto será mantida permanentemente no sistema
                        const currentUser = localStorage.getItem('kanban_user');
                        if (currentUser) {
                            localStorage.setItem(`kanban_user_photo_${currentUser}`, photoData);
                        }
                        
                        // Re-renderizar cards para atualizar fotos
                        this.renderBoard();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    // Função auxiliar para obter foto do usuário por nome
    getUserPhoto(name) {
        if (!name) return null;
        const nameLower = name.toLowerCase().trim();
        
        // Tentar buscar por nome exato
        let photo = localStorage.getItem(`kanban_user_photo_${nameLower}`);
        if (photo) return photo;
        
        // Tentar buscar por primeiro nome
        const firstName = nameLower.split(' ')[0];
        photo = localStorage.getItem(`kanban_user_photo_${firstName}`);
        if (photo) return photo;
        
        // Buscar em todas as fotos salvas que correspondem ao nome
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('kanban_user_photo_')) {
                const storedName = key.replace('kanban_user_photo_', '').toLowerCase();
                // Comparar o primeiro nome do responsável com o nome armazenado
                if (storedName.includes(firstName) || firstName.includes(storedName.split('.')[0])) {
                    return localStorage.getItem(key);
                }
            }
        }
        
        return null;
    }

    async fetchData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            const data = await res.json();
            
            // Verificar se a resposta tem estrutura com data.tasks ou apenas tasks
            let tasksArray = null;
            if (data.data && data.data.tasks && Array.isArray(data.data.tasks)) {
                tasksArray = data.data.tasks;
            } else if (data.tasks && Array.isArray(data.tasks)) {
                tasksArray = data.tasks;
            }
            
            if (tasksArray) {
                // Filtrar cabeçalhos caso venham como dados (primeira linha com ID = "Id" ou "ID")
                this.tasks = tasksArray.filter(task => {
                    const id = String(task.id || '').trim();
                    // Remover se for cabeçalho (id é "id", "Id", "ID", ou string muito curta que não é numérica)
                    const idLower = id.toLowerCase();
                    if (idLower === 'id' || id === '' || id === 'undefined') {
                        return false;
                    }
                    // IDs válidos são numéricos ou UUIDs longos
                    return id.length > 3 || !isNaN(parseInt(id));
                });
                // Carregar histórico do localStorage para cada tarefa
                this.tasks.forEach(task => {
                    const historyKey = `kanban_column_history_${task.id}`;
                    const storedHistory = localStorage.getItem(historyKey);
                    if (storedHistory) {
                        try {
                            task.columnHistory = JSON.parse(storedHistory);
                        } catch (e) {
                            task.columnHistory = [];
                        }
                    } else if (!task.columnHistory) {
                        task.columnHistory = [];
                    }
                });
                // Initial update based on potentially stored project
                this.updateSelectors();
                this.renderDashboard();
                this.renderBoard();
            }
        } catch (err) { console.error(err); }
    }

    setupFilters() {
        // Filtros do menu lateral
        const pSelector = document.getElementById('sidebar-project-selector');
        const rSelector = document.getElementById('sidebar-responsible-selector');
        const sSelector = document.getElementById('sidebar-sector-selector');

        // Restaurar seleções do localStorage
        if (pSelector) {
            pSelector.value = this.currentProject;
        pSelector.onchange = (e) => {
            this.currentProject = e.target.value;
                localStorage.setItem('kanban_filter_project', this.currentProject);
            this.updateSelectors();
            this.renderBoard();
        };
        }

        if (rSelector) {
            rSelector.value = this.currentResponsible;
        rSelector.onchange = (e) => {
            this.currentResponsible = e.target.value;
                localStorage.setItem('kanban_filter_responsible', this.currentResponsible);
            this.updateSelectors();
            this.renderBoard();
        };
        }

        if (sSelector) {
            sSelector.value = this.currentSector;
        sSelector.onchange = (e) => {
            this.currentSector = e.target.value;
                localStorage.setItem('kanban_filter_sector', this.currentSector);
            this.updateSelectors();
            this.renderBoard();
        };
        }
    }

    updateSelectors() {
        // Filter tasks based on current selections to show only valid options in OTHER dropdowns
        const getFilteredTasks = (exclude = '') => {
            return this.tasks.filter(t => {
                const matchProject = exclude === 'project' || !this.currentProject || t.project === this.currentProject;
                const matchResponsible = exclude === 'responsible' || !this.currentResponsible || t.responsible === this.currentResponsible;
                const matchSector = exclude === 'sector' || !this.currentSector || t.sector === this.currentSector;
                return matchProject && matchResponsible && matchSector;
            });
        };

        const availableProjects = new Set(getFilteredTasks('project').map(t => t.project).filter(p => p));
        const availableResponsibles = new Set(getFilteredTasks('responsible').map(t => t.responsible).filter(r => r));
        const availableSectors = new Set(getFilteredTasks('sector').map(t => t.sector).filter(s => s));

        const render = (el, set, current, placeholder) => {
            const previousValue = el.value;
            // Limpar e criar option vazio de forma segura
            el.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = placeholder;
            el.appendChild(defaultOpt);
            // Adicionar opções usando createElement (seguro)
            Array.from(set).sort().forEach(val => {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = val; // textContent é mais seguro que innerText
                if (val === current) opt.selected = true;
                el.appendChild(opt);
            });
            if (current && !set.has(current)) {
                el.value = "";
                return false;
            }
            return true;
        };

        const pSelector = document.getElementById('sidebar-project-selector');
        const rSelector = document.getElementById('sidebar-responsible-selector');
        const sSelector = document.getElementById('sidebar-sector-selector');

        const pValid = pSelector ? render(pSelector, availableProjects, this.currentProject, "Todos os Projetos") : true;
        if (!pValid) {
            this.currentProject = "";
            localStorage.setItem('kanban_filter_project', "");
        }

        const rValid = rSelector ? render(rSelector, availableResponsibles, this.currentResponsible, "Todos os Responsáveis") : true;
        if (!rValid) {
            this.currentResponsible = "";
            localStorage.setItem('kanban_filter_responsible', "");
        }

        const sValid = sSelector ? render(sSelector, availableSectors, this.currentSector, "Todos os Setores") : true;
        if (!sValid) {
            this.currentSector = "";
            localStorage.setItem('kanban_filter_sector', "");
        }

        // 3. Populate Modal Datalist for Projects
        const datalist = document.getElementById('project-list');
        if (datalist) {
            const allProjects = new Set(this.tasks.map(t => t.project).filter(p => p));
            datalist.innerHTML = '';
            Array.from(allProjects).sort().forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                datalist.appendChild(opt);
            });
        }
    }

    renderDashboard() {
        // This function is now primarily for dashboard.html, but if elements exist, update them.
        const totalEl = document.getElementById('stat-total');
        const completedEl = document.getElementById('stat-completed');
        const adherenceEl = document.getElementById('stat-adherence');

        if (!totalEl || !completedEl || !adherenceEl) {
            // Elements not found, likely on kanban.html
            // Verificar se projeto atual está concluído para mostrar botão PDF
            this.checkProjectCompleted();
            return;
        }

        // Filter tasks based on current filters
        let filteredTasks = this.tasks;
        if (this.currentProject) filteredTasks = filteredTasks.filter(t => t.project === this.currentProject);
        if (this.currentResponsible) filteredTasks = filteredTasks.filter(t => t.responsible === this.currentResponsible);
        if (this.currentSector) filteredTasks = filteredTasks.filter(t => t.sector === this.currentSector);

        // Get unique projects from filtered tasks
        const relevantProjects = [...new Set(filteredTasks.map(t => t.project).filter(p => p))];
        const totalProjectsCount = relevantProjects.length;

        // A project is "100% complete" if ALL its tasks are done
        let completedProjectsCount = 0;
        relevantProjects.forEach(projectName => {
            const projectTasks = filteredTasks.filter(t => t.project === projectName);
            const projectDone = projectTasks.filter(t => t.columnId === 'done').length;
            if (projectTasks.length > 0 && projectTasks.length === projectDone) {
                completedProjectsCount++;
            }
        });

        // Adherence: completed projects / total projects
        const adherenceValue = totalProjectsCount === 0 ? 0 : (completedProjectsCount / totalProjectsCount) * 100;
        const adherence = Math.round(adherenceValue * 100) / 100; // Mantém 2 casas decimais

        if (totalEl) totalEl.innerText = totalProjectsCount;
        if (completedEl) completedEl.innerText = completedProjectsCount;
        if (adherenceEl) {
        adherenceEl.innerText = `${adherence}%`;
        
        // Aplicar cor baseada na aderência
        adherenceEl.className = 'dash-value adherence';
        if (adherence === 100) {
            adherenceEl.style.color = '#10b981'; // Verde
        } else if (adherence >= 91) {
            adherenceEl.style.color = '#3b82f6'; // Azul (91 até 99.99%)
        } else if (adherence >= 76) {
            adherenceEl.style.color = '#f59e0b'; // Laranja (76 até 90.99%)
        } else {
            adherenceEl.style.color = '#ef4444'; // Vermelho (0 até 75.99%)
        }
        }
    }

    renderBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';

        let filtered = this.tasks;
        if (this.currentProject) filtered = filtered.filter(t => t.project === this.currentProject);
        if (this.currentResponsible) filtered = filtered.filter(t => t.responsible === this.currentResponsible);
        if (this.currentSector) filtered = filtered.filter(t => t.sector === this.currentSector);

        if (filtered.length === 0) {
            const hasFilters = this.currentProject || this.currentResponsible || this.currentSector;
            const msg = hasFilters ? "Nenhuma tarefa encontrada com esses filtros." : "Nenhuma tarefa cadastrada.";
            const emptyDiv = document.createElement('div');
            emptyDiv.style.color = '#666';
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.width = '100%';
            emptyDiv.style.marginTop = '3rem';
            emptyDiv.textContent = msg;
            board.appendChild(emptyDiv);
            return;
        }

        COLUMNS.forEach(col => {
            const colTasks = filtered.filter(t => t.columnId === col.id);
            const colEl = document.createElement('div');
            colEl.className = 'column';
            colEl.id = col.id;
            colEl.innerHTML = `
                <div class="column-header" style="border-bottom-color: ${col.color}">
                    <h2>${col.title} <span style="opacity:0.5; font-size:0.8em">(${colTasks.length})</span></h2>
                    <button class="add-btn" data-col="${col.id}">+</button>
                </div>
                <div class="task-list" id="list-${col.id}"></div>
            `;

            const list = colEl.querySelector(`#list-${col.id}`);
            colTasks.forEach(task => {
                const el = this.createCard(task, col.gradient || col.color);
                list.appendChild(el);
            });

            const addBtn = colEl.querySelector('.add-btn');
            if (addBtn && canCreateCard()) {
                addBtn.onclick = () => this.openModal(col.id);
            } else if (addBtn) {
                // Esconder botão de adicionar se não tiver permissão
                addBtn.style.display = 'none';
            }
            board.appendChild(colEl);
        });

        this.setupDragDrop();
    }

    getDaysRemaining(endDateStr) {
        if (!endDateStr) return null;
        const end = new Date(endDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(end)) return null;
        const diffTime = end - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    createCard(task, accentColor) {
        const div = document.createElement('div');
        div.className = 'task';
        div.draggable = canMoveCard(task);
        div.id = task.id;
        
        const column = COLUMNS.find(col => col.id === task.columnId);
        const gradient = column ? column.gradient : accentColor;
        div.style.background = gradient;
        div.style.color = '#ffffff';

        const emojiMap = {
            'todo': '😐',
            'inprogress': '😊',
            'validation': '🔍',
            'done': '🤩'
        };
        const emoji = emojiMap[task.columnId] || '📋';

        const remaining = this.getDaysRemaining(task.endDate);
        const priority = task.priority || 'media';
        let priorityText = 'Média';
        let priorityColor = '#f59e0b';
        
        if (priority === 'alta') {
            priorityText = 'Alta';
            priorityColor = '#ef4444';
        } else if (priority === 'baixa') {
            priorityText = 'Baixa';
            priorityColor = '#3b82f6';
        }
        
        const dateEnd = task.endDate ? new Date(task.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        const canEdit = canEditCard(task);
        const canDelete = canDeleteCard(task);
        
        // Foto e nome do responsável no canto superior direito (SEGURO)
        if (task.responsible) {
            const ownerTop = document.createElement('div');
            ownerTop.className = 'task-owner-top';
            const ownerPhoto = this.getUserPhoto(task.responsible);
            const initial = task.responsible.charAt(0).toUpperCase();
            
            if (ownerPhoto) {
                const img = document.createElement('img');
                img.src = ownerPhoto;
                img.alt = task.responsible;
                img.className = 'task-owner-photo-img';
                img.onerror = function() {
                    this.style.display = 'none';
                    if (this.nextElementSibling) {
                        this.nextElementSibling.style.display = 'flex';
                    }
                };
                ownerTop.appendChild(img);
            }
            
            const ownerPhotoDiv = document.createElement('div');
            ownerPhotoDiv.className = 'task-owner-photo';
            ownerPhotoDiv.setAttribute('data-initial', initial);
            if (ownerPhoto) ownerPhotoDiv.style.display = 'none';
            ownerPhotoDiv.textContent = initial;
            ownerTop.appendChild(ownerPhotoDiv);
            
            const ownerName = document.createElement('div');
            ownerName.className = 'task-owner-name-top';
            ownerName.textContent = task.responsible;
            ownerTop.appendChild(ownerName);
            
            div.appendChild(ownerTop);
        }
        
        // Linha 1: Título da tarefa e Projeto (SEGURO - usando textContent)
        const line1 = document.createElement('div');
        line1.className = 'task-line-1';
        
        const taskContent = document.createElement('span');
        taskContent.className = 'task-content';
        taskContent.textContent = task.content || '';
        line1.appendChild(taskContent);
        
        if (task.project) {
            const projectName = document.createElement('span');
            projectName.className = 'task-project-name';
            projectName.textContent = task.project;
            line1.appendChild(projectName);
        }
        div.appendChild(line1);
        
        // Linha 2: Setor e Emoji (SEGURO)
        const line2 = document.createElement('div');
        line2.className = 'task-line-2';
        
        const badgeSector = document.createElement('span');
        badgeSector.className = 'badge-sector';
        badgeSector.textContent = task.sector || 'Logística';
        line2.appendChild(badgeSector);
        
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'task-emoji-large';
        emojiSpan.textContent = emoji;
        line2.appendChild(emojiSpan);
        div.appendChild(line2);
        
        // Linha 3: Data prevista e criticidade (SEGURO)
        const line3 = document.createElement('div');
        line3.className = 'task-line-3';
        
        if (dateEnd) {
            const datePrev = document.createElement('div');
            datePrev.className = 'task-date-prev';
            datePrev.textContent = 'Prev: ' + dateEnd;
            line3.appendChild(datePrev);
        }
        
        const priorityBadge = document.createElement('div');
        priorityBadge.className = 'priority-badge';
        priorityBadge.style.background = 'rgba(0, 0, 0, 0.3)';
        priorityBadge.style.borderLeft = `2px solid ${priorityColor}`;
        const prioritySpan = document.createElement('span');
        prioritySpan.style.color = 'rgba(255, 255, 255, 0.9)';
        prioritySpan.style.fontWeight = '600';
        prioritySpan.style.fontSize = '0.7rem';
        prioritySpan.textContent = priorityText;
        priorityBadge.appendChild(prioritySpan);
        line3.appendChild(priorityBadge);
        div.appendChild(line3);
        
        // Alertas na parte inferior central (SEGURO)
        const alertsContainer = document.createElement('div');
        alertsContainer.className = 'task-alerts-bottom-center';
        
        if (remaining !== null) {
            const remainSpan = document.createElement('span');
            if (task.columnId === 'done') {
                if (remaining >= 0) {
                    remainSpan.className = 'days-remaining ok';
                    remainSpan.textContent = 'Concluído dentro do prazo';
            } else {
                    remainSpan.className = 'days-remaining late';
                    remainSpan.textContent = `Concluído fora do prazo (+${Math.abs(remaining)} dias)`;
                }
            } else {
                if (remaining < 0) {
                    remainSpan.className = 'days-remaining late';
                    remainSpan.textContent = `⚠️ ${Math.abs(remaining)} dias atrasado`;
                } else if (remaining === 0) {
                    remainSpan.className = 'days-remaining late';
                    remainSpan.textContent = 'Hoje';
                } else if (remaining <= 2) {
                    remainSpan.className = 'days-remaining soon';
                    remainSpan.textContent = `⏱️ ${remaining} dias`;
                } else {
                    remainSpan.className = 'days-remaining ok';
                    remainSpan.textContent = `${remaining} dias`;
                }
            }
            alertsContainer.appendChild(remainSpan);
        }
        
        if (task.dateChangeStatus === 'postergada') {
            const dateAlert = document.createElement('div');
            dateAlert.className = 'date-change-alert postergada';
            dateAlert.textContent = '📅 Data prevista postergada';
            alertsContainer.appendChild(dateAlert);
        } else if (task.dateChangeStatus === 'antecipada') {
            const dateAlert = document.createElement('div');
            dateAlert.className = 'date-change-alert antecipada';
            dateAlert.textContent = '📅 Data prevista antecipada';
            alertsContainer.appendChild(dateAlert);
        }
        div.appendChild(alertsContainer);
        
        // Botões de calendário e PDF no canto inferior direito (acima de editar/deletar)
        const topActionsContainer = document.createElement('div');
        topActionsContainer.className = 'task-top-actions-bottom-right';
        
        // Botão de histórico/calendário (sempre visível)
        const historyBtn = document.createElement('button');
        historyBtn.className = 'action-icon history-btn';
        historyBtn.setAttribute('data-id', task.id);
        historyBtn.setAttribute('title', 'Histórico de mudanças de coluna');
        const historyIcon = document.createElement('ion-icon');
        historyIcon.setAttribute('name', 'calendar-outline');
        historyBtn.appendChild(historyIcon);
        topActionsContainer.appendChild(historyBtn);
        
        // Botão de PDF/Impressora (sempre visível - gera PDF do projeto)
        const pdfBtn = document.createElement('button');
        pdfBtn.className = 'action-icon pdf-btn';
        pdfBtn.setAttribute('data-project', task.project || '');
        pdfBtn.setAttribute('title', 'Gerar PDF do projeto');
        const pdfIcon = document.createElement('ion-icon');
        pdfIcon.setAttribute('name', 'print-outline');
        pdfBtn.appendChild(pdfIcon);
        topActionsContainer.appendChild(pdfBtn);
        
        div.appendChild(topActionsContainer);
        
        // Botões de editar e deletar no canto inferior direito
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'task-actions-bottom-right';
        
        let editBtn = null;
        let deleteBtn = null;
        
        if (canEdit) {
            editBtn = document.createElement('button');
            editBtn.className = 'action-icon edit-btn';
            editBtn.setAttribute('data-id', task.id);
            editBtn.setAttribute('title', 'Editar tarefa');
            const editIcon = document.createElement('ion-icon');
            editIcon.setAttribute('name', 'pencil');
            editBtn.appendChild(editIcon);
            actionsContainer.appendChild(editBtn);
        }
        
        if (canDelete) {
            deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-icon delete-btn';
            deleteBtn.setAttribute('data-id', task.id);
            deleteBtn.setAttribute('title', 'Excluir tarefa');
            const deleteIcon = document.createElement('ion-icon');
            deleteIcon.setAttribute('name', 'trash');
            deleteBtn.appendChild(deleteIcon);
            actionsContainer.appendChild(deleteBtn);
        }
        
        div.appendChild(actionsContainer);

        // Add event listeners

        // Prevent drag when clicking buttons
        if (historyBtn) {
            historyBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            historyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.showColumnHistory(task.id);
            });
        }
        
        if (pdfBtn) {
            pdfBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            pdfBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Salvar projeto atual temporariamente
                const originalProject = this.currentProject;
                if (task.project) {
                    this.currentProject = task.project;
                    localStorage.setItem('kanban_filter_project', this.currentProject);
                }
                this.generateProjectPDF();
                // Restaurar projeto original se necessário
                if (originalProject !== task.project) {
                    this.currentProject = originalProject;
                    localStorage.setItem('kanban_filter_project', originalProject || '');
                }
            });
        }

        if (editBtn) {
            editBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.loadEdit(task.id);
        });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.deleteTask(task.id);
        });
        }

        return div;
    }

    deleteTask(id) {
        // Verificar permissão de exclusão
        const userPerms = getUserPermissions();
        if (!userPerms || userPerms.email !== 'maicon.amaral@transmagnabosco.com.br') {
            alert('Apenas Maicon Amaral pode excluir tarefas e projetos.');
            return;
        }

        // Converter ID para string para comparação consistente
        const targetId = String(id);
        
        // Verificar se a tarefa existe
        const taskExists = this.tasks.some(t => String(t.id) === targetId);
        if (!taskExists) {
            console.error('Tarefa não encontrada para exclusão. ID:', targetId);
            alert('Tarefa não encontrada. Por favor, recarregue a página.');
            return;
        }

        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            // Remover a tarefa
            const beforeCount = this.tasks.length;
            this.tasks = this.tasks.filter(t => String(t.id) !== targetId);
            const afterCount = this.tasks.length;
            
            console.log(`Tarefa excluída. Antes: ${beforeCount}, Depois: ${afterCount}`);
            
            this.renderBoard();
            this.updateSelectors();
            this.renderDashboard();
            this.sync();
        }
    }

    loadEdit(id) {
        const task = this.tasks.find(t => String(t.id) === String(id));
        if (!task) return;
        
        // Armazenar a data original para comparação
        this.originalEndDate = task.endDate;
        this.originalTaskId = task.id;

        const tasksContainer = document.getElementById('tasks-container');
        const sectorsContainer = document.getElementById('sectors-container');
        const responsiblesContainer = document.getElementById('responsibles-container');
        
        document.getElementById('modal-title').innerText = 'Editar Tarefa';
        document.getElementById('inp-id').value = task.id;
        document.getElementById('inp-project').value = task.project || '';
        document.getElementById('inp-objective').value = task.objective || '';
        document.getElementById('inp-priority').value = task.priority || 'media';
        const parseDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
        document.getElementById('inp-start').value = parseDate(task.startDate);
        document.getElementById('inp-end').value = parseDate(task.endDate);
        this.pendingColId = task.columnId;
        
        // Limpar e preencher campos dinâmicos com os valores da tarefa
        // Tarefas
        tasksContainer.innerHTML = '';
            const taskContents = Array.isArray(task.content) ? task.content : [task.content];
            taskContents.forEach((content, index) => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'dynamic-field';
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'inp-task';
                input.placeholder = 'Descrição da atividade';
                input.value = content || '';
                fieldDiv.appendChild(input);
                if (index > 0) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn-remove-field';
                    removeBtn.textContent = '✕';
                    removeBtn.onclick = () => fieldDiv.remove();
                    fieldDiv.appendChild(removeBtn);
                }
                tasksContainer.appendChild(fieldDiv);
            });

        // Setores
        sectorsContainer.innerHTML = '';
            const taskSectors = Array.isArray(task.sector) ? task.sector : [task.sector];
            taskSectors.forEach((sector, index) => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'dynamic-field';
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'inp-sector';
                input.placeholder = 'Ex: Frota';
                input.value = sector || '';
                fieldDiv.appendChild(input);
                if (index > 0) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn-remove-field';
                    removeBtn.textContent = '✕';
                    removeBtn.onclick = () => fieldDiv.remove();
                    fieldDiv.appendChild(removeBtn);
                }
                sectorsContainer.appendChild(fieldDiv);
            });

        // Responsáveis
        responsiblesContainer.innerHTML = '';
            const taskResponsibles = Array.isArray(task.responsible) ? task.responsible : [task.responsible];
            taskResponsibles.forEach((responsible, index) => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'dynamic-field';
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'inp-responsible';
                input.placeholder = 'Nome';
                input.value = responsible || '';
                fieldDiv.appendChild(input);
                if (index > 0) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn-remove-field';
                    removeBtn.textContent = '✕';
                    removeBtn.onclick = () => fieldDiv.remove();
                    fieldDiv.appendChild(removeBtn);
                }
                responsiblesContainer.appendChild(fieldDiv);
            });
        
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    setupModal() {
        const overlay = document.getElementById('modal-overlay');
        const btnCancel = document.getElementById('btn-cancel');
        const btnSave = document.getElementById('btn-save');
        const btnAddTask = document.getElementById('btn-add-task');
        const btnAddResponsible = document.getElementById('btn-add-responsible');
        const btnAddSector = document.getElementById('btn-add-sector');
        const tasksContainer = document.getElementById('tasks-container');
        const responsiblesContainer = document.getElementById('responsibles-container');
        const sectorsContainer = document.getElementById('sectors-container');

        // Função para adicionar campo de tarefa
        const addTaskField = () => {
            const existingFields = tasksContainer.querySelectorAll('.dynamic-field').length;
            if (existingFields >= 10) {
                alert('Máximo de 10 tarefas permitido');
                return;
            }
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'dynamic-field';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inp-task';
            input.placeholder = 'Descrição da atividade';
            fieldDiv.appendChild(input);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-field';
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => fieldDiv.remove();
            fieldDiv.appendChild(removeBtn);
            tasksContainer.appendChild(fieldDiv);
        };

        // Função para adicionar campo de setor
        const addSectorField = () => {
            const existingFields = sectorsContainer.querySelectorAll('.dynamic-field').length;
            if (existingFields >= 10) {
                alert('Máximo de 10 setores permitido');
                return;
            }
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'dynamic-field';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inp-sector';
            input.placeholder = 'Ex: Frota';
            fieldDiv.appendChild(input);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-field';
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => fieldDiv.remove();
            fieldDiv.appendChild(removeBtn);
            sectorsContainer.appendChild(fieldDiv);
        };

        // Função para adicionar campo de responsável
        const addResponsibleField = () => {
            const existingFields = responsiblesContainer.querySelectorAll('.dynamic-field').length;
            if (existingFields >= 10) {
                alert('Máximo de 10 responsáveis permitido');
                return;
            }
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'dynamic-field';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inp-responsible';
            input.placeholder = 'Nome';
            fieldDiv.appendChild(input);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-field';
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => fieldDiv.remove();
            fieldDiv.appendChild(removeBtn);
            responsiblesContainer.appendChild(fieldDiv);
        };

        btnAddTask.onclick = addTaskField;
        btnAddSector.onclick = addSectorField;
        btnAddResponsible.onclick = addResponsibleField;

        this.closeModal = () => overlay.classList.add('hidden');
        this.openModal = (colId) => {
            this.pendingColId = colId || 'todo';
            document.getElementById('modal-title').innerText = 'Nova Tarefa';
            document.getElementById('inp-id').value = '';
            document.getElementById('inp-project').value = this.currentProject || '';
            document.getElementById('inp-objective').value = '';
            document.getElementById('inp-priority').value = 'media';
            document.getElementById('inp-start').value = '';
            document.getElementById('inp-end').value = '';
            
            // Limpar e resetar campos dinâmicos (SEGURO)
            tasksContainer.innerHTML = '';
            const taskFieldDiv = document.createElement('div');
            taskFieldDiv.className = 'dynamic-field';
            const taskInput = document.createElement('input');
            taskInput.type = 'text';
            taskInput.className = 'inp-task';
            taskInput.placeholder = 'Descrição da atividade';
            taskFieldDiv.appendChild(taskInput);
            tasksContainer.appendChild(taskFieldDiv);
            
            sectorsContainer.innerHTML = '';
            const sectorFieldDiv = document.createElement('div');
            sectorFieldDiv.className = 'dynamic-field';
            const sectorInput = document.createElement('input');
            sectorInput.type = 'text';
            sectorInput.className = 'inp-sector';
            sectorInput.placeholder = 'Ex: Frota';
            sectorFieldDiv.appendChild(sectorInput);
            sectorsContainer.appendChild(sectorFieldDiv);
            
            responsiblesContainer.innerHTML = '';
            const responsibleFieldDiv = document.createElement('div');
            responsibleFieldDiv.className = 'dynamic-field';
            const responsibleInput = document.createElement('input');
            responsibleInput.type = 'text';
            responsibleInput.className = 'inp-responsible';
            responsibleInput.placeholder = 'Nome';
            responsibleFieldDiv.appendChild(responsibleInput);
            responsiblesContainer.appendChild(responsibleFieldDiv);
            
            overlay.classList.remove('hidden');
        };
        btnCancel.onclick = this.closeModal;
        btnSave.onclick = () => {
            const id = document.getElementById('inp-id').value;
            const project = document.getElementById('inp-project').value.trim();
            const objective = document.getElementById('inp-objective').value.trim();
            const priority = document.getElementById('inp-priority').value;
            const startDate = document.getElementById('inp-start').value;
            const endDate = document.getElementById('inp-end').value;

            // Coletar todas as tarefas
            const taskInputs = tasksContainer.querySelectorAll('.inp-task');
            const tasks = Array.from(taskInputs).map(inp => inp.value.trim()).filter(v => v);

            // Coletar todos os setores
            const sectorInputs = sectorsContainer.querySelectorAll('.inp-sector');
            const sectors = Array.from(sectorInputs).map(inp => inp.value.trim()).filter(v => v);

            // Coletar todos os responsáveis
            const responsibleInputs = responsiblesContainer.querySelectorAll('.inp-responsible');
            const responsibles = Array.from(responsibleInputs).map(inp => inp.value.trim()).filter(v => v);

            if (!project || tasks.length === 0) { 
                alert('Projeto e pelo menos uma Tarefa são obrigatórios.'); 
                return; 
            }

            let dateChangeStatus = null;
            if (id && this.originalTaskId === id) { // Apenas se for edição da tarefa original
                const newEndDate = new Date(endDate);
                const oldEndDate = new Date(this.originalEndDate);
                if (newEndDate > oldEndDate) {
                    dateChangeStatus = 'postergada';
                } else if (newEndDate < oldEndDate) {
                    dateChangeStatus = 'antecipada';
                }
            }

            // Se há apenas uma tarefa, um setor e um responsável, salvar normalmente (compatibilidade)
            if (tasks.length === 1 && sectors.length <= 1 && responsibles.length <= 1) {
                const taskData = { 
                    id, 
                    project, 
                    objective,
                    content: tasks[0], 
                    sector: sectors[0] || '', 
                    responsible: responsibles[0] || '', 
                    priority, 
                    startDate, 
                    endDate, 
                    columnId: this.pendingColId,
                    dateChangeStatus: dateChangeStatus
                };
            this.saveTask(taskData);
            } else {
                // Criar múltiplas tarefas combinando tarefas, setores e responsáveis
                tasks.forEach((taskContent, taskIndex) => {
                    // Para cada tarefa, combinar com setores e responsáveis
                    // Se houver mais tarefas que setores/responsáveis, usar o primeiro ou o correspondente por índice
                    const sector = sectors[taskIndex] || sectors[0] || '';
                    const responsible = responsibles[taskIndex] || responsibles[0] || '';
                    
                    const taskData = { 
                        id: id && taskIndex === 0 ? id : '', // Só manter ID na primeira tarefa se for edição
                        project, 
                        objective,
                        content: taskContent, 
                        sector, 
                        responsible, 
                        priority, 
                        startDate, 
                        endDate, 
                        columnId: this.pendingColId,
                        dateChangeStatus: taskIndex === 0 ? dateChangeStatus : null // Só na primeira tarefa se for edição
                    };
                    this.saveTask(taskData);
                });
            }
            
            this.closeModal();
        };
        overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    }

    saveTask(data) {
        // Ensure ID is a string for consistent comparison
        const targetId = data.id ? String(data.id) : null;

        if (targetId) {
            const idx = this.tasks.findIndex(t => String(t.id) === targetId);
            if (idx !== -1) {
                // Update existing task, merging old and new data
                // Preservar o histórico se não estiver sendo atualizado
                const existingHistory = this.tasks[idx].columnHistory || [];
                this.tasks[idx] = { 
                    ...this.tasks[idx], 
                    ...data, 
                    id: targetId,
                    columnHistory: data.columnHistory || existingHistory
                };
            }
        } else {
            // New task
            const newTask = {
                ...data,
                id: Date.now().toString(),
                columnId: data.columnId || 'todo',
                columnHistory: data.columnHistory || []
            };
            this.tasks.push(newTask);
            
            // Inicializar histórico se a tarefa já tiver uma coluna definida
            const finalColumnId = newTask.columnId || 'todo';
            if (!newTask.columnHistory || newTask.columnHistory.length === 0) {
                // Adicionar entrada inicial para a coluna atual
                this.addColumnHistory(newTask.id, null, finalColumnId);
            }

            // If we are creating a new task, we might want to switch to its project
            // but only if no project is currently selected
            if (!this.currentProject) {
                this.currentProject = data.project;
                localStorage.setItem('kanban_filter_project', this.currentProject);
            }
        }

        this.renderBoard();
        this.updateSelectors();
        this.renderDashboard();
        this.sync();
    }

    async sync() {
        if (this.isSyncing) return; // Prevent concurrent syncs
        this.isSyncing = true;

        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) refreshBtn.classList.add('syncing');

        try {
            // Prepare data for Google Script
            const payload = {
                tasks: this.tasks.map(t => ({
                    ...t,
                    id: String(t.id) // Ensure ID is string on backend too
                }))
            };

            // Google Apps Script: usar no-cors (não podemos ver a resposta, mas funciona)
            // Com no-cors, não conseguimos verificar erros, então assumimos sucesso
            fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => {
                // Erro silencioso - com no-cors não conseguimos ver se realmente deu erro
                console.warn('Sync request sent (no-cors mode - cannot verify success)', err);
            });
            
            console.log('Dados enviados para servidor');
        } catch (e) {
            // Erro apenas no console, não mostrar alert ao usuário
            // Com no-cors, erros de rede são silenciosos
            console.warn('Sync error (silent):', e);
        } finally {
            this.isSyncing = false;
            if (refreshBtn) refreshBtn.classList.remove('syncing');
        }
    }

    setupDragDrop() {
        let draggedId = null;

        document.querySelectorAll('.task').forEach(t => {
            t.addEventListener('dragstart', (e) => {
                // Se o usuário não tem permissão para mover este card, previne o drag
                const taskId = e.target.id;
                const task = this.tasks.find(t => t.id === taskId);
                if (!canMoveCard(task)) {
                    e.preventDefault();
                    alert('Você não tem permissão para mover este card.');
                    return;
                }

                if (e.target.closest('.action-icon')) {
                    e.preventDefault();
                    return;
                }
                draggedId = t.id;
                e.dataTransfer.effectAllowed = 'move';
                t.classList.add('dragging');

                // Set a ghost image or just let browser handle it
                e.dataTransfer.setData('text/plain', t.id);
            });

            t.addEventListener('dragend', () => {
                t.classList.remove('dragging');
                document.querySelectorAll('[id^="list-"]').forEach(l => l.classList.remove('dragover'));
            });
        });

        document.querySelectorAll('[id^="list-"]').forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                list.classList.add('dragover');
            });

            list.addEventListener('dragleave', (e) => {
                // Only remove if we really left the list container
                const rect = list.getBoundingClientRect();
                if (e.clientX < rect.left || e.clientX >= rect.right || e.clientY < rect.top || e.clientY >= rect.bottom) {
                    list.classList.remove('dragover');
                }
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('dragover');

                const id = e.dataTransfer.getData('text/plain') || draggedId;
                if (!id) return;

                const task = this.tasks.find(t => t.id === id);
                const newCol = list.id.replace('list-', '');

                // Verificar permissão antes de mover
                if (task && task.columnId !== newCol && canMoveCard(task)) {
                    const oldCol = task.columnId;
                    
                    // Registrar mudança de coluna no histórico ANTES de mudar a coluna
                    this.addColumnHistory(task.id, oldCol, newCol);
                    
                    // Agora mudar a coluna
                    task.columnId = newCol;
                    
                    this.renderBoard();
                    this.renderDashboard();
                    this.sync();
                } else if (task && !canMoveCard(task)) {
                    alert('Você não tem permissão para mover este card.');
                }

                draggedId = null;
            });
        });
    }
    
    // Adicionar entrada no histórico de mudanças de coluna
    addColumnHistory(taskId, fromColumn, toColumn) {
        // Garantir que taskId seja string para comparação
        const taskIdStr = String(taskId);
        const task = this.tasks.find(t => String(t.id) === taskIdStr);
        if (!task) {
            console.warn('Tarefa não encontrada para adicionar histórico:', taskIdStr);
            return;
        }
        
        // Não adicionar histórico se fromColumn for null ou undefined (criação inicial)
        if (fromColumn === null || fromColumn === undefined) {
            // Apenas inicializar o histórico vazio se não existir
            if (!task.columnHistory) {
                task.columnHistory = [];
            }
            return;
        }
        
        // Inicializar histórico se não existir
        if (!task.columnHistory) {
            task.columnHistory = [];
        }
        
        // Obter nome das colunas
        const fromColName = COLUMNS.find(col => col.id === fromColumn)?.title || fromColumn;
        const toColName = COLUMNS.find(col => col.id === toColumn)?.title || toColumn;
        
        // Obter informações do usuário atual
        const userPerms = getUserPermissions();
        const userName = userPerms ? userPerms.name : 'Usuário Desconhecido';
        
        // Adicionar entrada ao histórico
        const historyEntry = {
            fromColumn: fromColumn,
            fromColumnName: fromColName,
            toColumn: toColumn,
            toColumnName: toColName,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            }),
            time: new Date().toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            user: userName // Adicionar nome do usuário
        };
        
        task.columnHistory.push(historyEntry);
        
        // Salvar histórico no localStorage como backup
        const historyKey = `kanban_column_history_${taskIdStr}`;
        localStorage.setItem(historyKey, JSON.stringify(task.columnHistory));
    }
    
    // Obter histórico de mudanças de coluna (com fallback do localStorage)
    getColumnHistory(taskId) {
        // Garantir que taskId seja string para comparação
        const taskIdStr = String(taskId);
        const task = this.tasks.find(t => String(t.id) === taskIdStr);
        
        // Primeiro tentar do objeto da tarefa
        if (task && task.columnHistory && Array.isArray(task.columnHistory) && task.columnHistory.length > 0) {
            return task.columnHistory;
        }
        
        // Tentar carregar do localStorage
        const historyKey = `kanban_column_history_${taskIdStr}`;
        const storedHistory = localStorage.getItem(historyKey);
        if (storedHistory) {
            try {
                const history = JSON.parse(storedHistory);
                // Atualizar a tarefa com o histórico se existir
                if (task && Array.isArray(history)) {
                    task.columnHistory = history;
                }
                return Array.isArray(history) ? history : [];
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
            }
        }
        
        // Inicializar array vazio se não existir
        if (task && !task.columnHistory) {
            task.columnHistory = [];
        }
        
        return [];
    }
    
    // Mostrar modal com histórico de mudanças de coluna
    showColumnHistory(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const history = this.getColumnHistory(taskId);
        
        // Criar modal de histórico
        const modal = document.createElement('div');
        modal.className = 'history-modal';
        modal.style.display = 'flex';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'history-modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'history-modal-header';
        modalHeader.innerHTML = `
            <h3>Histórico de Mudanças de Coluna</h3>
            <button class="history-modal-close">&times;</button>
        `;
        
        const taskInfo = document.createElement('div');
        taskInfo.className = 'history-task-info';
        taskInfo.innerHTML = `
            <strong>${escapeHtml(task.content || 'Tarefa sem título')}</strong>
            ${task.project ? `<span class="history-project">${escapeHtml(task.project)}</span>` : ''}
        `;
        
        const historyList = document.createElement('div');
        historyList.className = 'history-list';
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">Nenhuma mudança de coluna registrada.</p>';
        } else {
            // Ordenar por timestamp (mais recente primeiro)
            const sortedHistory = [...history].sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            sortedHistory.forEach((entry, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const fromCol = COLUMNS.find(col => col.id === entry.fromColumn);
                const toCol = COLUMNS.find(col => col.id === entry.toColumn);
                
                // Criar elementos usando createElement para segurança XSS
                const historyIcon = document.createElement('div');
                historyIcon.className = 'history-icon';
                const iconArrow = document.createElement('ion-icon');
                iconArrow.setAttribute('name', 'arrow-forward');
                historyIcon.appendChild(iconArrow);
                
                const historyContent = document.createElement('div');
                historyContent.className = 'history-content';
                
                const historyColumns = document.createElement('div');
                historyColumns.className = 'history-columns';
                
                const historyFrom = document.createElement('span');
                historyFrom.className = 'history-from';
                historyFrom.style.color = fromCol?.color || '#666';
                historyFrom.textContent = entry.fromColumnName || entry.fromColumn;
                
                const iconArrowForward = document.createElement('ion-icon');
                iconArrowForward.setAttribute('name', 'arrow-forward-outline');
                
                const historyTo = document.createElement('span');
                historyTo.className = 'history-to';
                historyTo.style.color = toCol?.color || '#666';
                historyTo.textContent = entry.toColumnName || entry.toColumn;
                
                historyColumns.appendChild(historyFrom);
                historyColumns.appendChild(iconArrowForward);
                historyColumns.appendChild(historyTo);
                
                const historyDate = document.createElement('div');
                historyDate.className = 'history-date';
                const iconTime = document.createElement('ion-icon');
                iconTime.setAttribute('name', 'time-outline');
                historyDate.appendChild(iconTime);
                historyDate.appendChild(document.createTextNode(` ${entry.date} às ${entry.time}`));
                
                // Adicionar informação do usuário se disponível
                if (entry.user) {
                    const historyUser = document.createElement('div');
                    historyUser.className = 'history-user';
                    const iconUser = document.createElement('ion-icon');
                    iconUser.setAttribute('name', 'person-outline');
                    historyUser.appendChild(iconUser);
                    historyUser.appendChild(document.createTextNode(` ${entry.user}`));
                    historyContent.appendChild(historyColumns);
                    historyContent.appendChild(historyDate);
                    historyContent.appendChild(historyUser);
                } else {
                    historyContent.appendChild(historyColumns);
                    historyContent.appendChild(historyDate);
                }
                
                historyItem.appendChild(historyIcon);
                historyItem.appendChild(historyContent);
                historyList.appendChild(historyItem);
            });
        }
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(taskInfo);
        modalContent.appendChild(historyList);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modalContent.querySelector('.history-modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    // Verificar se o projeto atual está 100% concluído (não é mais necessário, mas mantido para compatibilidade)
    checkProjectCompleted() {
        // Função mantida para compatibilidade, mas não faz nada agora
        // Os botões PDF estão nos cards individuais
        return false;
    }
    
    // Gerar PDF do projeto completo
    generateProjectPDF() {
        if (!this.currentProject) {
            alert('Nenhum projeto selecionado.');
            return;
        }
        
        const projectTasks = this.tasks.filter(t => t.project === this.currentProject);
        if (projectTasks.length === 0) {
            alert('Nenhuma tarefa encontrada para este projeto.');
            return;
        }
        
        // Verificar se jsPDF está disponível
        if (!window.jspdf) {
            alert('Erro: Biblioteca jsPDF não carregada. Recarregue a página.');
            return;
        }
        
        // Obter informações do projeto (da primeira tarefa)
        const firstTask = projectTasks[0];
        const projectName = firstTask.project || 'Projeto Sem Nome';
        const projectObjective = firstTask.objective || 'Sem objetivo definido';
        
        // Agrupar tarefas únicas
        const uniqueTasks = [...new Set(projectTasks.map(t => t.content))];
        const uniqueSectors = [...new Set(projectTasks.map(t => t.sector).filter(s => s))];
        const uniqueResponsibles = [...new Set(projectTasks.map(t => t.responsible).filter(r => r))];
        
        // Obter datas do projeto (mais antiga e mais recente)
        const dates = projectTasks
            .map(t => ({ start: t.startDate, end: t.endDate }))
            .filter(d => d.start || d.end);
        const earliestStart = dates.length > 0 
            ? dates.reduce((min, d) => (!min || (d.start && d.start < min)) ? d.start : min, null)
            : null;
        const latestEnd = dates.length > 0
            ? dates.reduce((max, d) => (!max || (d.end && d.end > max)) ? d.end : max, null)
            : null;
        
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Adicionar marca d'água "VALIDADO" na primeira página
        this.addWatermark(doc);
        
        let yPos = 20;
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - (margin * 2);
        
        // Título
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Relatório do Projeto', margin, yPos);
        yPos += 15;
        
        // Nome do Projeto
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(`Projeto: ${projectName}`, margin, yPos);
        yPos += 10;
        
        // Objetivo
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const objectiveLines = doc.splitTextToSize(`Objetivo: ${projectObjective}`, maxWidth);
        doc.text(objectiveLines, margin, yPos);
        yPos += objectiveLines.length * 6 + 10;
        
        // Informações do Projeto
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Informações do Projeto', margin, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Data de Início: ${earliestStart ? new Date(earliestStart).toLocaleDateString('pt-BR') : 'Não definida'}`, margin, yPos);
        yPos += 6;
        doc.text(`Data de Término: ${latestEnd ? new Date(latestEnd).toLocaleDateString('pt-BR') : 'Não definida'}`, margin, yPos);
        yPos += 6;
        doc.text(`Total de Tarefas: ${projectTasks.length}`, margin, yPos);
        yPos += 6;
        doc.text(`Setores Envolvidos: ${uniqueSectors.length > 0 ? uniqueSectors.join(', ') : 'Nenhum'}`, margin, yPos);
        yPos += 6;
        doc.text(`Responsáveis: ${uniqueResponsibles.length > 0 ? uniqueResponsibles.join(', ') : 'Nenhum'}`, margin, yPos);
        yPos += 15;
        
        // Verificar se precisa de nova página
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
            // Adicionar marca d'água na nova página
            this.addWatermark(doc);
        }
        
        // Tarefas
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Tarefas do Projeto', margin, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        uniqueTasks.forEach((task, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                // Adicionar marca d'água na nova página
                this.addWatermark(doc);
            }
            const taskInfo = projectTasks.find(t => t.content === task);
            doc.text(`${index + 1}. ${task}`, margin + 5, yPos);
            yPos += 6;
            
            if (taskInfo) {
                doc.setFontSize(10);
                const details = [];
                if (taskInfo.sector) details.push(`Setor: ${taskInfo.sector}`);
                if (taskInfo.responsible) details.push(`Responsável: ${taskInfo.responsible}`);
                if (taskInfo.priority) {
                    const priorityText = taskInfo.priority === 'alta' ? 'Alta' : taskInfo.priority === 'baixa' ? 'Baixa' : 'Média';
                    details.push(`Prioridade: ${priorityText}`);
                }
                if (details.length > 0) {
                    doc.text(`   ${details.join(' | ')}`, margin + 10, yPos);
                    yPos += 5;
                }
                doc.setFontSize(12);
            }
            yPos += 3;
        });
        
        yPos += 10;
        
        // Verificar se precisa de nova página para histórico
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        // Histórico de Mudanças de Coluna
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Histórico de Mudanças de Coluna', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Coletar histórico de todas as tarefas (sem duplicatas)
        const allHistory = [];
        const historySet = new Set(); // Para evitar duplicatas
        
        projectTasks.forEach(task => {
            const history = this.getColumnHistory(task.id);
            if (history && Array.isArray(history)) {
                history.forEach(entry => {
                    // Criar chave única para identificar duplicatas
                    const uniqueKey = `${task.id}_${entry.fromColumn}_${entry.toColumn}_${entry.timestamp}`;
                    if (!historySet.has(uniqueKey)) {
                        historySet.add(uniqueKey);
                        allHistory.push({
                            task: task.content,
                            taskId: task.id,
                            ...entry
                        });
                    }
                });
            }
        });
        
        // Ordenar por timestamp (mais recente primeiro)
        allHistory.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });
        
        if (allHistory.length === 0) {
            doc.text('Nenhuma mudança de coluna registrada.', margin, yPos);
        } else {
            allHistory.forEach((entry, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                    // Adicionar marca d'água na nova página
                    this.addWatermark(doc);
                }
                
                doc.setFont(undefined, 'bold');
                doc.text(`${index + 1}. Tarefa: ${entry.task}`, margin, yPos);
                yPos += 5;
                
                doc.setFont(undefined, 'normal');
                doc.text(`   De: ${entry.fromColumnName || entry.fromColumn}`, margin + 5, yPos);
                yPos += 5;
                doc.text(`   Para: ${entry.toColumnName || entry.toColumn}`, margin + 5, yPos);
                yPos += 5;
                doc.text(`   Data: ${entry.date} às ${entry.time}`, margin + 5, yPos);
                yPos += 5;
                doc.text(`   Usuário: ${entry.user || 'Não informado'}`, margin + 5, yPos);
                yPos += 5;
            });
        }
        
        // Data de geração do relatório
        doc.addPage();
        this.addWatermark(doc); // Adicionar marca d'água na última página
        yPos = 20;
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPos);
        
        // Salvar PDF
        const fileName = `Projeto_${projectName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }
    
    // Adicionar marca d'água "VALIDADO" no PDF
    addWatermark(doc) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Salvar configurações atuais (métodos básicos)
        const currentTextColor = doc.getTextColor ? doc.getTextColor() : [0, 0, 0];
        
        // Configurar estilo da marca d'água (cinza claro)
        doc.setTextColor(220, 220, 220); // Cinza muito claro
        doc.setFontSize(72);
        doc.setFont(undefined, 'bold');
        
        // Calcular posição central da página
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;
        
        // Usar método de rotação do jsPDF
        try {
            doc.text('VALIDADO', centerX, centerY, {
                angle: 45, // Rotação de 45 graus
                align: 'center',
                baseline: 'middle'
            });
        } catch (e) {
            // Fallback: texto sem rotação se não suportar
            doc.text('VALIDADO', centerX, centerY, {
                align: 'center',
                baseline: 'middle'
            });
        }
        
        // Restaurar configurações originais
        if (currentTextColor && Array.isArray(currentTextColor)) {
            doc.setTextColor(currentTextColor[0], currentTextColor[1], currentTextColor[2]);
        } else {
            doc.setTextColor(0, 0, 0); // Preto como padrão
        }
        doc.setFontSize(12); // Restaurar tamanho padrão
        doc.setFont(undefined, 'normal'); // Restaurar estilo padrão
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
