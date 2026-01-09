# 💾 Como os Dados São Salvos na Planilha

## ✅ Confirmação

**TUDO é criado dentro do sistema e salvo na planilha Google Sheets como base de dados.**

---

## 📊 Estrutura da Base de Dados

### Planilha Google Sheets

O Google Apps Script usa uma planilha Google Sheets como banco de dados. Todos os dados são salvos lá.

### O Que É Salvo na Planilha

#### 1. **Tarefas do Kanban** (Aba principal)
- ID da tarefa
- Projeto
- Objetivo
- Conteúdo/Tarefa
- Setor
- Responsável
- Prioridade (Baixa/Média/Alta)
- Data de início
- Data de fim
- Status (Não Iniciado, Em Andamento, Validação, Concluído)
- Histórico de mudanças de coluna

#### 2. **Cronograma** (Aba Cronograma)
- **Reuniões:**
  - Data
  - Horário
  - Título
  - Anotações

- **Eventos:**
  - Data
  - Nome do evento
  - Data de fim (se houver)
  - Tipo (evento normal, folga, fim de evento)

- **Plantões:**
  - Data de início
  - Data de fim
  - Nome da pessoa
  - Relacionamento com folgas

---

## 🔄 Fluxo de Salvamento

### Quando Você Cria/Altera Algo:

```
1. Você preenche o formulário no site
   ↓
2. Clica em "Salvar"
   ↓
3. Dados são enviados para Google Apps Script (via API)
   ↓
4. Google Apps Script processa os dados
   ↓
5. Google Apps Script salva na planilha Google Sheets
   ↓
6. Dados ficam permanentemente salvos
   ↓
7. Outros usuários veem ao recarregar a página
```

---

## 📋 Detalhes Técnicos

### API do Google Apps Script

**URL da API:**
```
https://script.google.com/macros/s/AKfycbzups-xiV57iFmlV1OYzi3Fp6_qOtZ3DOl1sJPp38dwMGsHjioNIF3UIiE_PI-vKUVu/exec
```

### Endpoints

#### 1. **GET** - Buscar Dados
```
GET /exec?action=cronograma
```
Retorna todos os dados do cronograma (reuniões, eventos, plantões)

```
GET /exec
```
Retorna todas as tarefas do Kanban

#### 2. **POST** - Salvar Dados
```
POST /exec
Body: {
  action: 'cronograma',
  data: {
    meetings: {...},
    events: {...},
    plantoes: {...}
  }
}
```
Salva dados do cronograma

```
POST /exec
Body: {
  tasks: [...]
}
```
Salva tarefas do Kanban

---

## 🗂️ Estrutura da Planilha

### Abas da Planilha

O Google Apps Script gerencia automaticamente as abas:

1. **Aba "Tasks"** (ou similar)
   - Todas as tarefas do Kanban
   - Uma linha por tarefa
   - Colunas: ID, Projeto, Objetivo, Conteúdo, Setor, Responsável, Prioridade, Data Início, Data Fim, Status, etc.

2. **Aba "Cronograma"** (ou similar)
   - Reuniões, eventos e plantões
   - Estrutura JSON ou colunas específicas

---

## ✅ Vantagens Desta Abordagem

### 1. **Simplicidade**
- ✅ Não precisa de servidor próprio
- ✅ Não precisa de banco de dados complexo
- ✅ Google Sheets é gratuito e fácil de usar

### 2. **Acessibilidade**
- ✅ Pode abrir a planilha diretamente no Google Sheets
- ✅ Pode exportar para Excel
- ✅ Pode fazer backup facilmente

### 3. **Colaboração**
- ✅ Múltiplos usuários podem acessar
- ✅ Dados sempre sincronizados
- ✅ Histórico de alterações (se habilitado)

### 4. **Confiabilidade**
- ✅ Google cuida do backup
- ✅ Dados sempre disponíveis
- ✅ Não perde dados

---

## 🔍 Como Verificar os Dados

### Opção 1: Via Google Sheets

1. Acesse: https://sheets.google.com
2. Abra a planilha usada pelo Google Apps Script
3. Veja todos os dados salvos
4. Pode editar diretamente (se tiver permissão)

### Opção 2: Via API

1. Abra no navegador:
```
https://script.google.com/macros/s/AKfycbzups-xiV57iFmlV1OYzi3Fp6_qOtZ3DOl1sJPp38dwMGsHjioNIF3UIiE_PI-vKUVu/exec
```

2. Verá JSON com todas as tarefas

---

## 📝 Exemplo de Dados Salvos

### Tarefa do Kanban:
```json
{
  "id": "1234567890",
  "project": "Entrega SP",
  "objective": "Entregar produtos em São Paulo",
  "content": "Preparar carga",
  "sector": "Frota",
  "responsible": "João Silva",
  "priority": "alta",
  "startDate": "2026-01-01",
  "endDate": "2026-01-15",
  "columnId": "inprogress"
}
```

### Plantão:
```json
{
  "2026-01-04": {
    "startDate": "2026-01-04",
    "endDate": "2026-01-05",
    "person": "Maria Santos"
  }
}
```

---

## ⚠️ Importante

### Backup Automático
- ✅ Google Sheets faz backup automático
- ✅ Pode restaurar versões anteriores
- ✅ Dados nunca são perdidos

### Limites
- ⚠️ Google Sheets tem limite de células (5 milhões)
- ⚠️ Para projetos muito grandes, pode precisar otimizar
- ✅ Para uso normal, é mais que suficiente

### Segurança
- ✅ Dados ficam na sua conta Google
- ✅ Você controla quem tem acesso
- ✅ Pode compartilhar a planilha se necessário

---

## 🎯 Resumo

- ✅ **Tudo é salvo na planilha Google Sheets**
- ✅ **Base de dados única para todos os usuários**
- ✅ **Dados permanentes e seguros**
- ✅ **Fácil de acessar e gerenciar**
- ✅ **Backup automático pelo Google**

---

**Status:** ✅ Funcionando perfeitamente!  
**Base de Dados:** Google Sheets  
**Acesso:** Via Google Apps Script API





