// API_URL será obtida do main.js se disponível, senão usa esta
const API_URL = typeof window !== 'undefined' && window.KANBAN_API_URL 
    ? window.KANBAN_API_URL 
    : 'https://script.google.com/macros/s/AKfycbylY8f__8tujbaY-MwnknDvSSMQwTPgq5xWet0veq4Q0jS5HfYJu0HPmj9AxwBpoVzl/exec';

class DashboardApp {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.dateStart = null;
        this.dateEnd = null;
        this.charts = {};
        this.init();
    }

    async init() {
        this.setupDateFilters();
        await this.fetchData();
        // applyDateFilter já é chamado dentro de fetchData, mas vamos garantir
        if (!this.filteredTasks || this.filteredTasks.length === 0) {
            this.filteredTasks = this.tasks || [];
        }
        this.renderDashboardCards();
        this.renderCharts();
    }
    
    renderDashboardCards() {
        // Usar filteredTasks para considerar todos os filtros aplicados
        // Se filteredTasks estiver vazio mas tasks não, usar tasks
        let filteredTasks = this.tasks || [];
        if (this.filteredTasks && this.filteredTasks.length > 0) {
            filteredTasks = this.filteredTasks;
        } else if (this.tasks && this.tasks.length > 0) {
            filteredTasks = this.tasks;
            this.filteredTasks = this.tasks; // Garantir sincronização
        }

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

        const totalEl = document.getElementById('stat-total');
        const completedEl = document.getElementById('stat-completed');
        const adherenceEl = document.getElementById('stat-adherence');

        if (totalEl) totalEl.innerText = totalProjectsCount;
        if (completedEl) completedEl.innerText = completedProjectsCount;
        if (adherenceEl) {
            adherenceEl.innerText = `${adherence}%`;
            // Color based on adherence
            if (adherence >= 100) {
                adherenceEl.style.color = '#10b981'; // Verde
            } else if (adherence >= 91) {
                adherenceEl.style.color = '#3b82f6'; // Azul
            } else if (adherence >= 76) {
                adherenceEl.style.color = '#f59e0b'; // Laranja
            } else {
                adherenceEl.style.color = '#ef4444'; // Vermelho
            }
        }
    }

    async fetchData() {
        try {
            console.log('Buscando dados do dashboard...');
            const res = await fetch(API_URL + '?t=' + Date.now());
            console.log('Resposta recebida:', res);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Dados recebidos:', data);
            
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
                console.log('Total de tarefas carregadas:', this.tasks.length);
                // Inicializar filteredTasks com todas as tarefas antes de aplicar filtros
                this.filteredTasks = this.tasks;
                this.applyDateFilter();
                console.log('Total de tarefas após filtros:', this.filteredTasks.length);
            } else {
                console.warn('Nenhuma tarefa encontrada nos dados ou formato inválido:', data);
                this.tasks = [];
                this.filteredTasks = [];
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            alert('Erro ao carregar dados do dashboard. Verifique o console para mais detalhes.');
            this.tasks = [];
            this.filteredTasks = [];
        }
    }

    setupDateFilters() {
        // Não definir datas por padrão - mostrar todas as tarefas inicialmente
        const startInput = document.getElementById('date-start');
        const endInput = document.getElementById('date-end');
        
        // Deixar vazio para mostrar todas as tarefas
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';

        this.dateStart = null;
        this.dateEnd = null;
    }

    filterByDate() {
        const startInput = document.getElementById('date-start');
        const endInput = document.getElementById('date-end');

        if (startInput && startInput.value) {
            this.dateStart = new Date(startInput.value);
            this.dateStart.setHours(0, 0, 0, 0);
        } else {
            this.dateStart = null;
        }
        if (endInput && endInput.value) {
            this.dateEnd = new Date(endInput.value);
            this.dateEnd.setHours(23, 59, 59, 999);
        } else {
            this.dateEnd = null;
        }

        console.log('Aplicando filtro de data. dateStart:', this.dateStart, 'dateEnd:', this.dateEnd);
        this.applyDateFilter();
        console.log('Tarefas após filtro:', this.filteredTasks.length);
        this.renderDashboardCards();
        this.renderCharts();
    }

    clearFilters() {
        // Limpar filtros de data
        const startInput = document.getElementById('date-start');
        const endInput = document.getElementById('date-end');
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
        this.dateStart = null;
        this.dateEnd = null;
        
        // Reaplicar filtros (que agora estarão vazios, então mostrará todas as tarefas)
        this.applyDateFilter();
        console.log('Filtros limpos. Tarefas:', this.filteredTasks.length);
        this.renderDashboardCards();
        this.renderCharts();
    }

    applyDateFilter() {
        // Aplicar filtros de projeto, setor e responsável do localStorage (sincronização com kanban)
        let filtered = this.tasks || [];
        const filterProject = localStorage.getItem('kanban_filter_project') || '';
        const filterSector = localStorage.getItem('kanban_filter_sector') || '';
        const filterResponsible = localStorage.getItem('kanban_filter_responsible') || '';
        
        console.log('Aplicando filtros. Projeto:', filterProject, 'Setor:', filterSector, 'Responsável:', filterResponsible);
        console.log('Tarefas antes dos filtros:', filtered.length);
        
        if (filterProject) {
            filtered = filtered.filter(t => t.project === filterProject);
            console.log('Após filtrar por projeto:', filtered.length);
        }
        if (filterSector) {
            filtered = filtered.filter(t => t.sector === filterSector);
            console.log('Após filtrar por setor:', filtered.length);
        }
        if (filterResponsible) {
            filtered = filtered.filter(t => t.responsible === filterResponsible);
            console.log('Após filtrar por responsável:', filtered.length);
        }
        
        if (!this.dateStart && !this.dateEnd) {
            this.filteredTasks = filtered;
            console.log('Filtro de data não aplicado. filteredTasks:', this.filteredTasks.length);
            return;
        }

        // Normalizar datas de filtro para início e fim do dia
        const filterStart = this.dateStart ? new Date(this.dateStart) : null;
        if (filterStart) filterStart.setHours(0, 0, 0, 0);
        
        const filterEnd = this.dateEnd ? new Date(this.dateEnd) : null;
        if (filterEnd) filterEnd.setHours(23, 59, 59, 999);

        this.filteredTasks = filtered.filter(task => {
            // Se não tiver data, não filtrar (incluir na lista)
            if (!task.startDate && !task.endDate) return true;

            // Tratar diferentes formatos de data
            let taskStart = null;
            let taskEnd = null;
            
            if (task.startDate) {
                taskStart = new Date(task.startDate);
                if (isNaN(taskStart.getTime())) {
                    // Tentar formato com T
                    taskStart = new Date(task.startDate + 'T00:00:00');
                }
                if (!isNaN(taskStart.getTime())) {
                    taskStart.setHours(0, 0, 0, 0);
                } else {
                    taskStart = null;
                }
            }
            
            if (task.endDate) {
                taskEnd = new Date(task.endDate);
                if (isNaN(taskEnd.getTime())) {
                    // Tentar formato com T
                    taskEnd = new Date(task.endDate + 'T23:59:59');
                }
                if (!isNaN(taskEnd.getTime())) {
                    taskEnd.setHours(23, 59, 59, 999);
                } else {
                    taskEnd = null;
                }
            }

            // Tarefa deve estar dentro do período (qualquer sobreposição)
            if (filterStart && taskEnd && taskEnd < filterStart) return false;
            if (filterEnd && taskStart && taskStart > filterEnd) return false;

            return true;
        });
    }

    renderCharts() {
        // Garantir que filteredTasks esteja populado antes de renderizar
        if (!this.filteredTasks || this.filteredTasks.length === 0) {
            this.filteredTasks = this.tasks || [];
        }
        this.renderProjectsBySector();
        this.renderCompletedByResponsible();
        this.renderTasksByPriority();
        this.renderResponsiblesBarChart();
    }

    renderProjectsBySector() {
        const sectorProjects = {};
        const tasksToUse = (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : (this.tasks || []);

        tasksToUse.forEach(task => {
            if (!task.sector) return;
            if (!sectorProjects[task.sector]) {
                sectorProjects[task.sector] = new Set();
            }
            if (task.project) {
                sectorProjects[task.sector].add(task.project);
            }
        });

        const sectors = Object.keys(sectorProjects);
        const projectCounts = sectors.map(s => sectorProjects[s].size);

        const ctx = document.getElementById('chart-projects-sector');
        if (this.charts.projectsSector) {
            this.charts.projectsSector.destroy();
        }

        this.charts.projectsSector = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sectors,
                datasets: [{
                    label: 'Projetos',
                    data: projectCounts,
                    backgroundColor: 'rgba(56, 189, 248, 0.8)',
                    borderColor: '#38bdf8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' projeto(s)';
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: function(value) {
                            return value;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#aaa',
                            stepSize: 1
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
    }

    renderCompletedByResponsible() {
        const responsibleCompleted = {};
        const tasksToUse = (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : (this.tasks || []);

        tasksToUse.forEach(task => {
            if (!task.responsible || task.columnId !== 'done') return;
            responsibleCompleted[task.responsible] = (responsibleCompleted[task.responsible] || 0) + 1;
        });

        const responsibles = Object.keys(responsibleCompleted);
        const completedCounts = responsibles.map(r => responsibleCompleted[r]);

        if (responsibles.length === 0) {
            console.log('Nenhum responsável com tarefas concluídas encontrado');
        }

        const ctx = document.getElementById('chart-completed-responsible');
        if (this.charts.completedResponsible) {
            this.charts.completedResponsible.destroy();
        }

        this.charts.completedResponsible = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: responsibles,
                datasets: [{
                    label: 'Tarefas Concluídas',
                    data: completedCounts,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' tarefa(s)';
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: function(value) {
                            return value;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#aaa',
                            stepSize: 1
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
    }

    renderTasksByPriority() {
        const priorityCounts = {
            'baixa': 0,
            'media': 0,
            'alta': 0
        };
        const tasksToUse = (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : (this.tasks || []);

        tasksToUse.forEach(task => {
            const priority = task.priority || 'media';
            if (priorityCounts.hasOwnProperty(priority)) {
                priorityCounts[priority]++;
            }
        });

        const ctx = document.getElementById('chart-priority-line');
        if (!ctx) return;

        if (this.charts.priorityLine) {
            this.charts.priorityLine.destroy();
        }

        this.charts.priorityLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Baixa', 'Média', 'Alta'],
                datasets: [{
                    label: 'Quantidade de Tarefas',
                    data: [priorityCounts.baixa, priorityCounts.media, priorityCounts.alta],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top-right',
                        align: 'end',
                        labels: {
                            color: '#fff',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: function(value) {
                            return value;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#aaa',
                            stepSize: 1
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
    }

    renderResponsiblesBarChart() {
        // Calcular tarefas concluídas e projetos finalizados por mês
        const monthlyStats = {};
        const tasksToUse = (this.filteredTasks && this.filteredTasks.length > 0) ? this.filteredTasks : (this.tasks || []);
        // Usar todas as tarefas (não filtradas) para verificar conclusão completa de projetos
        const allTasks = this.tasks || [];
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // Primeiro, contar tarefas concluídas por mês
        tasksToUse.forEach(task => {
            if (task.columnId !== 'done') return;
            
            // Obter mês da data de conclusão (endDate)
            let taskMonth = null;
            let taskYear = null;
            
            if (task.endDate) {
                const endDate = new Date(task.endDate);
                if (!isNaN(endDate.getTime())) {
                    taskMonth = endDate.getMonth();
                    taskYear = endDate.getFullYear();
                }
            }
            
            // Se não tem data, pular esta tarefa (não usar fallback)
            if (taskMonth === null || taskYear === null) {
                return;
            }
            
            const monthKey = `${taskYear}-${String(taskMonth + 1).padStart(2, '0')}`;
            
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    year: taskYear,
                    month: taskMonth,
                    completedTasks: 0,
                    completedProjects: new Set()
                };
            }
            
            // Contar tarefa concluída
            monthlyStats[monthKey].completedTasks++;
        });

        // Segundo, calcular projetos finalizados por mês
        // Um projeto é finalizado no mês em que a última tarefa foi concluída
        const projectLastCompletion = {};
        
        // Encontrar a data de conclusão da última tarefa de cada projeto
        allTasks.forEach(task => {
            if (task.columnId !== 'done' || !task.project || !task.endDate) return;
            
            const endDate = new Date(task.endDate);
            if (isNaN(endDate.getTime())) return;
            
            if (!projectLastCompletion[task.project]) {
                projectLastCompletion[task.project] = endDate;
            } else if (endDate > projectLastCompletion[task.project]) {
                projectLastCompletion[task.project] = endDate;
            }
        });

        // Para cada projeto, verificar se está 100% concluído e adicionar ao mês correto
        Object.keys(projectLastCompletion).forEach(projectName => {
            const projectTasks = allTasks.filter(t => t.project === projectName);
            const completedProjectTasks = projectTasks.filter(t => t.columnId === 'done').length;
            
            // Projeto está 100% concluído se todas as tarefas estão em 'done'
            if (projectTasks.length > 0 && projectTasks.length === completedProjectTasks) {
                const lastCompletionDate = projectLastCompletion[projectName];
                const taskMonth = lastCompletionDate.getMonth();
                const taskYear = lastCompletionDate.getFullYear();
                const monthKey = `${taskYear}-${String(taskMonth + 1).padStart(2, '0')}`;
                
                // Adicionar ao mês correspondente apenas se estiver nas estatísticas
                if (monthlyStats[monthKey]) {
                    monthlyStats[monthKey].completedProjects.add(projectName);
                }
            }
        });

        // Ordenar por data (mais antigo primeiro)
        const sortedMonths = Object.entries(monthlyStats)
            .sort((a, b) => {
                if (a[1].year !== b[1].year) {
                    return a[1].year - b[1].year;
                }
                return a[1].month - b[1].month;
            })
            .slice(-12); // Últimos 12 meses

        if (sortedMonths.length === 0) {
            const ctx = document.getElementById('chart-responsibles-bar');
            if (ctx && this.charts.responsiblesBar) {
                this.charts.responsiblesBar.destroy();
            }
            return;
        }

        // Criar labels com nomes dos meses
        const monthLabels = sortedMonths.map(([key, stats]) => {
            return `${monthNames[stats.month]}/${stats.year}`;
        });
        
        const taskCounts = sortedMonths.map(([key, stats]) => stats.completedTasks);
        const projectCounts = sortedMonths.map(([key, stats]) => stats.completedProjects.size);

        const ctx = document.getElementById('chart-responsibles-bar');
        if (!ctx) return;

        if (this.charts.responsiblesBar) {
            this.charts.responsiblesBar.destroy();
        }

        this.charts.responsiblesBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Tarefas Concluídas',
                        data: taskCounts,
                        backgroundColor: 'rgba(56, 189, 248, 0.8)',
                        borderColor: '#38bdf8',
                        borderWidth: 1
                    },
                    {
                        label: 'Projetos Finalizados',
                        data: projectCounts,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#fff',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                if (label === 'Tarefas Concluídas') {
                                    return label + ': ' + value + ' tarefa(s)';
                                } else {
                                    return label + ': ' + value + ' projeto(s)';
                                }
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#fff',
                        font: {
                            weight: 'bold'
                        },
                        formatter: function(value) {
                            return value;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#aaa',
                            stepSize: 1
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaa'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            },
            plugins: typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []
        });
    }
}

// Registrar plugin ChartDataLabels se disponível
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});








