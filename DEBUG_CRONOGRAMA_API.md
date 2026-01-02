# 🔍 Debug - Cronograma não aparecendo para outros usuários

## ✅ Checklist de Verificação

### 1. **Verificar se o código do Google Apps Script foi atualizado**

1. Acesse: https://script.google.com
2. Abra seu projeto do Kanban
3. Verifique se o código contém as funções:
   - `getCronogramaSheet()`
   - `getCronograma()`
   - `saveCronograma()`
   - `formatDateKey()`
4. Verifique se `doGet` e `doPost` têm suporte para `action === 'cronograma'`

### 2. **Verificar se fez novo Deploy**

1. No Google Apps Script, clique em **"Implantar"** → **"Gerenciar implantações"**
2. Se necessário, faça uma **nova implantação**:
   - Clique em **"Nova implantação"**
   - Tipo: **"Aplicativos da Web"**
   - Execute como: **"Me"**
   - Quem tem acesso: **"Qualquer pessoa"** ou **"Todos"**
   - Clique em **"Implantar"**

### 3. **Testar a API diretamente no navegador**

Abra uma nova aba e cole esta URL (substitua pela sua URL do Google Apps Script):

```
https://script.google.com/macros/s/SUA_URL_AQUI/exec?action=cronograma
```

**O que esperar:**
```json
{
  "status": "success",
  "message": "Cronograma retrieved successfully",
  "data": {
    "meetings": {},
    "events": {},
    "plantoes": {}
  }
}
```

Se retornar erro, o problema está no código do Google Apps Script.

### 4. **Verificar Console do Navegador**

1. Abra a página do cronograma
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **"Console"**
4. Procure por mensagens como:
   - ✅ "Tentando carregar reuniões da API"
   - ✅ "Carregando reuniões da API: X reuniões encontradas"
   - ❌ "Erro ao carregar reuniões da API"

### 5. **Verificar se a aba "Cronograma" existe na planilha**

1. Abra sua planilha do Google Sheets
2. Verifique se existe uma aba chamada **"Cronograma"**
3. Se não existir, ela será criada automaticamente na primeira execução

### 6. **Testar salvando um evento/reunião**

1. Crie um evento ou reunião no cronograma
2. Abra o Console (F12)
3. Procure por:
   - "Salvando eventos na API"
   - "Eventos salvos com sucesso"
   - Ou mensagens de erro

## 🐛 Problemas Comuns

### Problema 1: "Erro 404" ou "Página não encontrada"
**Solução:** A URL da API está errada ou o deploy não foi feito corretamente.

### Problema 2: "CORS error"
**Solução:** O Google Apps Script gerencia CORS automaticamente. Se aparecer erro de CORS, pode ser problema de configuração do deploy.

### Problema 3: "status: 'error'" na resposta
**Solução:** Abra o código do Google Apps Script, vá em "Executar" → "testAPI" e veja os erros.

### Problema 4: API retorna vazio `{}`
**Solução:** Isso é normal se não houver dados ainda. Tente criar um evento e verificar se salva.

## 📝 Como testar passo a passo

1. **Abra o Console (F12)**
2. **Recarregue a página (F5)**
3. **Procure pelas mensagens no console:**
   ```
   Tentando carregar reuniões da API: https://script.google.com/...
   Resposta da API (reuniões): {status: "success", ...}
   Carregando reuniões da API: 0 reuniões encontradas
   ```

4. **Se aparecer erro, copie a mensagem completa e verifique:**
   - Qual é o erro exato?
   - Qual é a URL que está sendo chamada?
   - Qual é a resposta da API?

## ✅ Se tudo estiver correto

Se todos os passos acima estiverem ok e ainda assim não funcionar, verifique:

1. **Todos os usuários estão usando a mesma URL?**
   - A URL do Google Apps Script deve ser a mesma para todos

2. **A planilha está compartilhada?**
   - Não precisa compartilhar manualmente, mas verifique se o script tem acesso

3. **Cache do navegador:**
   - Limpe o cache (Ctrl+Shift+Delete)
   - Ou use modo anônimo para testar

## 🆘 Se ainda não funcionar

Envie:
1. Mensagens de erro do Console (F12)
2. Resposta da API quando testar diretamente no navegador
3. Screenshot do código do Google Apps Script (funções doGet e doPost)







