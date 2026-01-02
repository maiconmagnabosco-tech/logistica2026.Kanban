# 📅 Integração do Cronograma com Google Sheets

## 📋 Passo a Passo

### 1. **Criar aba "Cronograma" na planilha**

1. Abra sua planilha do Google Sheets
2. Clique no "+" (ou botão direito na última aba) para criar nova aba
3. Renomeie para: **"Cronograma"**
4. A aba será criada automaticamente pelo script, mas você pode criar manualmente se preferir

### 2. **Atualizar o código do Google Apps Script**

1. Acesse: https://script.google.com
2. Abra seu projeto do Kanban
3. **Copie todo o conteúdo do arquivo `google-script-CRONOGRAMA.js`**
4. **Cole no final do seu código atual** (ou substitua as funções doGet/doPost conforme indicado)

### 3. **Atualizar doGet e doPost no Google Apps Script**

No seu código atual, localize as funções `doGet` e `doPost` e adicione o suporte para cronograma:

#### **doGet** - Adicione antes do código existente:

```javascript
function doGet(e) {
    // Adicionar suporte para cronograma
    const action = e.parameter.action;
    
    if (action === 'cronograma') {
        try {
            const cronograma = getCronograma();
            return createSuccessResponse(cronograma, 'Cronograma retrieved successfully');
        } catch (err) {
            return createErrorResponse('Erro ao buscar cronograma: ' + err.toString(), 500);
        }
    }
    
    // ... seu código existente para buscar tarefas ...
}
```

#### **doPost** - Adicione no início, após parse do JSON:

```javascript
function doPost(e) {
    // ... validações existentes ...
    
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
    
    // ... seu código existente para salvar tarefas ...
}
```

### 4. **Fazer novo Deploy**

1. No Google Apps Script, clique em **"Implantar"** → **"Nova implantação"**
2. Selecione **"Aplicativos da Web"**
3. Deixe as configurações padrão
4. Clique em **"Implantar"**
5. **Copie a nova URL** (se mudou)
6. Atualize no código frontend se necessário

### 5. **O código frontend já foi atualizado!**

O arquivo `schedule.js` já tem as funções preparadas para usar a API. As funções `loadMeetings`, `saveMeetings`, `loadEvents`, `saveEvents`, `loadPlantoes`, `savePlantoes` serão atualizadas automaticamente para usar a API em vez do localStorage.

## ✅ Estrutura da Aba "Cronograma"

A aba terá as seguintes colunas:

- **Colunas 1-4**: Reuniões (data | titulo | hora | anotacoes)
- **Colunas 5-11**: Eventos (data | nome | data_fim | is_end_event | is_folga | person | plantao_start_date)
- **Colunas 12-14**: Plantões (data_inicio | data_fim | person)

## 🔄 Como Funciona

1. **Ao carregar a página**: Faz GET para `?action=cronograma`
2. **Ao salvar evento/reunião/plantão**: Faz POST com `{ action: 'cronograma', data: { meetings, events, plantoes } }`
3. **Todos os usuários** verão os mesmos dados, pois estão salvos na planilha compartilhada

## ⚠️ Importante

- A aba "Cronograma" será criada automaticamente na primeira execução
- Todos os dados antigos do localStorage serão perdidos (mas podem ser migrados manualmente se necessário)
- Certifique-se de fazer o deploy após atualizar o código







