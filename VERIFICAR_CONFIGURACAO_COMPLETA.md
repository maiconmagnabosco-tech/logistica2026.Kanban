# 🔍 Verificar Configuração Completa do Google Apps Script

## ⚠️ Se já está como "Qualquer pessoa" mas ainda não funciona:

### Verificações Necessárias:

1. **Verificar se realmente está como "Qualquer pessoa, mesmo anônimo"**
   - Às vezes aparece apenas "Qualquer pessoa" mas precisa ser explícito "Qualquer pessoa, mesmo anônimo"
   - Se não aparecer essa opção, pode ser que já esteja configurado corretamente

2. **Verificar se fez um NOVO deploy após mudar a configuração**
   - Depois de mudar a configuração, é necessário fazer um novo deploy
   - Clique em "Nova versão" ou "Implantar" novamente

3. **Verificar se autorizou corretamente**
   - Quando fizer o deploy, pode pedir autorização
   - É necessário autorizar o script a acessar a planilha

4. **Verificar permissões da planilha**
   - A planilha do Google Sheets também precisa estar compartilhada
   - Pode ser "Qualquer pessoa com o link" ou "Visualizador"

5. **Testar a URL diretamente no navegador**
   - Abra: https://script.google.com/macros/s/AKfycbwjH08lxMnv5NPTpK74sA8KqGjkaiNXDyBRj2sBeKSgps0vdjt9WTpAmFneavjFuQ2N/exec?action=cronograma
   - Deve retornar JSON, não uma página de login

### Passos para Garantir:

1. **No Google Apps Script:**
   - Vá em "Publicar" → "Implantar como aplicativo da web"
   - Se for editar uma implantação existente, clique no ícone de lápis
   - Versão: "Nova"
   - Executar como: "Eu (seu email)"
   - Quem pode acessar: **Verifique TODAS as opções disponíveis**
   - Se houver "Qualquer pessoa, mesmo anônimo" → SELECIONE ESTA
   - Se só houver "Qualquer pessoa" → SELECIONE ESTA (pode funcionar)
   - Clique em "Implantar"
   - **IMPORTANTE:** Se pedir autorização, AUTORIZE

2. **No Google Sheets (Planilha):**
   - Abra sua planilha
   - Clique em "Compartilhar"
   - Configure como: "Qualquer pessoa com o link" (pode ser "Visualizador")
   - Ou deixe privada, mas o script precisa ter acesso

3. **Testar no navegador:**
   - Abra a URL da API no navegador:
     `https://script.google.com/macros/s/AKfycbwjH08lxMnv5NPTpK74sA8KqGjkaiNXDyBRj2sBeKSgps0vdjt9WTpAmFneavjFuQ2N/exec?action=cronograma`
   - Deve mostrar JSON, não página de login
   - Se mostrar JSON → está funcionando
   - Se pedir login → precisa mudar para "Qualquer pessoa, mesmo anônimo"

4. **No Kanban:**
   - Recarregue a página (Ctrl+Shift+R para limpar cache)
   - Abra o Console (F12)
   - Tente salvar novamente
   - Veja os erros no console

### Se Ainda Não Funcionar:

- Verifique o console do navegador (F12) para ver o erro exato
- Verifique se a URL da API está correta no código
- Tente fazer um deploy completamente novo (não editar, criar novo)







