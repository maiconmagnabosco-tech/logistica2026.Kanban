# 🔄 Como Atualizar o Google Apps Script com a Nova API

Este guia mostra como atualizar seu Google Apps Script com a versão melhorada da API.

---

## 📋 O Que Foi Melhorado

A nova versão inclui:

✅ **Validações de Segurança**
- Validação de tamanho de payload
- Sanitização de dados
- Validação de tipos e valores permitidos
- Rate limiting básico

✅ **Logs de Acesso**
- Registro automático de todas as requisições
- Sheet "Logs" criada automaticamente
- Registra: data, hora, ação, método, sucesso, erros

✅ **Melhor Tratamento de Erros**
- Mensagens de erro mais claras
- Códigos de status HTTP adequados
- Logs detalhados de erros

✅ **Estrutura Melhorada**
- Código mais organizado e comentado
- Funções auxiliares reutilizáveis
- Fácil manutenção e expansão

✅ **Inicialização Automática**
- Cria cabeçalhos automaticamente se não existirem
- Valida estrutura da planilha

---

## 🚀 Passo a Passo

### 1. Abrir Google Apps Script

1. Acesse: **https://script.google.com**
2. Faça login com sua conta Google
3. Abra o projeto do Kanban (ou crie um novo)

### 2. Substituir o Código

1. **Selecione TODO o código atual** (Ctrl+A)
2. **Delete** (Delete ou Backspace)
3. **Copie TODO o conteúdo** do arquivo `google-script-API-MELHORADA.js`
4. **Cole no Google Apps Script**
5. **Salve** (Ctrl+S ou File → Save)

### 3. Configurar Origens Permitidas

No código, localize esta seção (linha ~15):

```javascript
const ALLOWED_ORIGINS = [
    'https://kanban-logistica-magnabosco.vercel.app',  // ← ATUALIZE AQUI
    'https://*.vercel.app',                             
    'https://*.netlify.app',                            
    'http://localhost:8000',                            
    'http://127.0.0.1:8000',                           
];
```

**Substitua** `'https://kanban-logistica-magnabosco.vercel.app'` pela URL do seu deploy (ex: `'https://seu-projeto.vercel.app'`)

**Ou adicione mais URLs** se necessário, seguindo o padrão.

### 4. Fazer Deploy

1. Clique em **"Implantar"** (Deploy) no menu superior
2. Selecione **"Nova implantação"**
3. Clique no ícone de **engrenagem ⚙️** ao lado de "Tipo"
4. Selecione **"Aplicativos da Web"**
5. Configure:
   - **Descrição**: `API Kanban Logistica - Versão Melhorada`
   - **Executar como**: `Eu`
   - **Quem tem acesso**: `Qualquer pessoa` ou `Todos`
6. Clique em **"Implantar"**
7. Se aparecer **"Autorizar acesso"**, clique e autorize
8. **COPIE A NOVA URL** (será algo como: `https://script.google.com/macros/s/...`)

### 5. Atualizar URL no Código Frontend

1. Abra o arquivo `main.js` no seu projeto
2. Localize a linha:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/AKfycbx...';
   ```
3. **Substitua pela nova URL** que você copiou no passo anterior
4. Salve o arquivo

### 6. Testar

1. Abra seu projeto no navegador (local ou online)
2. Abra o Console do navegador (F12)
3. Teste o login e navegação
4. Verifique se os dados carregam corretamente
5. Teste criar/editar/deletar uma tarefa
6. Verifique se salva corretamente

---

## 📊 Verificar Logs

Após usar a API, você pode verificar os logs:

1. Abra sua planilha no Google Sheets
2. Procure por uma aba chamada **"Logs"** (será criada automaticamente)
3. Você verá registros de todas as requisições com:
   - Data e hora
   - Ação realizada (GET/POST)
   - Se foi bem-sucedida
   - Erros (se houver)

---

## 🔧 Funções Auxiliares Úteis

A nova API inclui funções que você pode executar manualmente no Google Apps Script:

### `setupSheet()`
Inicializa a planilha com os cabeçalhos corretos.

**Como usar:**
1. No Google Apps Script, selecione a função `setupSheet` no dropdown
2. Clique em "Executar" ▶️
3. Autorize se necessário
4. A planilha será configurada automaticamente

### `testAPI()`
Testa a API localmente.

**Como usar:**
1. No Google Apps Script, selecione a função `testAPI` no dropdown
2. Clique em "Executar" ▶️
3. Veja os resultados no Log (View → Logs)

---

## ⚠️ Importante: Estrutura da Planilha

Certifique-se de que sua planilha tem estas colunas (na ordem):

1. **id**
2. **project**
3. **objetivo**
4. **conteudo**
5. **status**
6. **setor**
7. **responsavel**
8. **data_inicio**
9. **data_fim**
10. **prioridade**
11. **dateChangeStatus**

A função `initializeSheet()` criará automaticamente se não existirem!

---

## 🔒 Configurações de Segurança

### Rate Limiting

A API tem rate limiting configurado:
- **100 requisições por minuto** por padrão
- Pode ser ajustado nas constantes no início do código

### Validações

- **Tamanho máximo de payload**: 1MB
- **Máximo de tarefas**: 10.000 por requisição
- **Valores permitidos**: Apenas valores válidos são aceitos

---

## 🆘 Problemas Comuns

### Erro: "Rate limit exceeded"
- **Causa**: Muitas requisições em pouco tempo
- **Solução**: Aguarde 1 minuto e tente novamente

### Erro: "Payload too large"
- **Causa**: Dados muito grandes (mais de 1MB)
- **Solução**: Reduza o número de tarefas ou tamanho dos dados

### Erro: "Invalid JSON format"
- **Causa**: Dados enviados não estão em formato JSON válido
- **Solução**: Verifique o código frontend que envia os dados

### Planilha não tem cabeçalhos
- **Causa**: Planilha foi criada manualmente sem cabeçalhos
- **Solução**: Execute a função `setupSheet()` ou deixe a API criar automaticamente

### Logs não aparecem
- **Causa**: Primeira execução ou erro ao criar sheet de logs
- **Solução**: A sheet "Logs" será criada na primeira requisição bem-sucedida

---

## ✅ Checklist de Atualização

- [ ] Código copiado para Google Apps Script
- [ ] Origens permitidas configuradas (ALLOWED_ORIGINS)
- [ ] Deploy feito no Google Apps Script
- [ ] Nova URL copiada
- [ ] URL atualizada no `main.js`
- [ ] Testado no navegador
- [ ] Logs verificados na planilha
- [ ] Tudo funcionando corretamente

---

## 📝 Notas

- A API mantém **compatibilidade total** com o código frontend existente
- Não é necessário alterar nada no frontend além da URL da API
- Os logs são opcionais e não afetam o funcionamento se falharem
- Rate limiting pode ser desabilitado comentando a verificação (não recomendado)

---

**Pronto!** Sua API está atualizada e mais segura! 🎉










