# 🔧 Resolver Erro "Failed to fetch" no Salvamento de Plantões

## ⚠️ Problema

O erro "Failed to fetch" ocorre quando há problema de **CORS** (Cross-Origin Resource Sharing) ou a API não está configurada corretamente.

## ✅ Solução: Configurar Google Apps Script

### Passo 1: Publicar como Web App Público

1. **Acesse:** https://script.google.com
2. **Abra seu projeto** (o script do Kanban)
3. **Clique em "Publicar"** → **"Implantar como aplicativo da web"**
4. **Configure:**
   - **Versão:** "Nova" (ou "Head")
   - **Executar como:** "Eu (seu email)"
   - **Quem tem acesso:** **"Qualquer pessoa, mesmo anônimo"** ← **MUITO IMPORTANTE!**
5. **Clique em "Implantar"**
6. **Autorize** (se solicitado)
7. **Copie a URL** gerada

### Passo 2: Verificar URL da API

A URL deve terminar com `/exec` (não `/dev`):

```
✅ CORRETO: https://script.google.com/macros/s/.../exec
❌ ERRADO: https://script.google.com/macros/s/.../dev
```

### Passo 3: Atualizar URL no Código (se necessário)

Se a URL mudou, atualize nos arquivos:
- `main.js` (linha 2)
- `schedule.js` (linha 2)
- `dashboard.js` (linha 4)

### Passo 4: Testar

1. **Recarregue a página** (F5)
2. **Tente salvar um plantão novamente**
3. **Verifique o console** (F12) para ver se há outros erros

## 🔍 Verificar se Está Funcionando

Abra o **Console do navegador** (F12) e verifique:

1. **Ao carregar a página:**
   - Deve aparecer: `Tentando carregar plantões da API: https://...`
   - Não deve aparecer erro de CORS

2. **Ao salvar:**
   - Deve aparecer: `Salvando plantões na API: X plantões`
   - Deve aparecer: `Plantões salvos com sucesso:`

## ⚠️ Se Ainda Não Funcionar

### Verificar Permissões da Planilha

1. **Abra sua planilha do Google Sheets**
2. **Clique em "Compartilhar"**
3. **Configure como:** "Qualquer pessoa com o link" (pode ser "Visualizador")

### Testar a API Diretamente

Abra no navegador:
```
https://script.google.com/macros/s/SUA_URL_AQUI/exec?action=cronograma
```

Deve retornar JSON com `{"status":"success","data":{...}}`

## 📝 Notas Importantes

- ✅ O Google Apps Script **deve** estar configurado como **"Qualquer pessoa, mesmo anônimo"**
- ✅ A URL deve terminar com `/exec` (não `/dev`)
- ✅ A planilha pode precisar estar compartilhada
- ✅ Sempre use a URL mais recente após fazer novo deploy do script







