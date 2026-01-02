# 🔧 Resolver Erro CORS - Passo a Passo

## ❌ Erro Atual:
```
O acesso ao recurso '...' foi bloqueado pela política CORS: 
A resposta à solicitação de verificação prévia não passou na verificação de controle de acesso: 
Nenhum cabeçalho 'Access-Control-Allow-Origin' está presente no recurso solicitado.
```

## ✅ Solução Completa:

### PASSO 1: Verificar o Código do Google Apps Script

1. Abra o Google Apps Script (script.google.com)
2. Abra o projeto do Kanban
3. **Copie TODO o conteúdo** do arquivo `COPIAR_PARA_GOOGLE_SCRIPT.js`
4. Cole no editor do Google Apps Script (substituindo tudo)
5. **Salve** (Ctrl+S ou Cmd+S)

### PASSO 2: Fazer Nova Implantação (MUITO IMPORTANTE!)

⚠️ **ESTE É O PASSO MAIS IMPORTANTE!** ⚠️

1. No Google Apps Script, clique em **"Implantar"** (menu superior)
2. Clique em **"Gerenciar implantações"**
3. Você verá uma lista de implantações
4. **Opção A - Se já existe uma implantação:**
   - Clique nos **3 pontinhos** (⋮) ao lado da implantação
   - Clique em **"Fazer nova implantação"**
   
   **Opção B - Se não existe implantação:**
   - Clique no botão **"Nova implantação"**
   - Clique no ícone de **engrenagem** (⚙️) à direita de "Tipo"
   - Selecione **"Aplicativo da web"**

5. **Configure a implantação:**
   - **Descrição:** `Versão com correção CORS` (ou qualquer nome)
   - **Executar como:** Selecione **"Eu"** (seu email)
   - **Quem tem acesso:** ⚠️ **"Qualquer pessoa, mesmo anônimo"** ⚠️
     - **MUITO IMPORTANTE:** Esta opção DEVE estar selecionada para CORS funcionar!
   
6. Clique em **"Implantar"**

7. **Copie a URL da implantação:**
   - Aparecerá uma URL que termina com `/exec`
   - Exemplo: `https://script.google.com/macros/s/AKfyc.../exec`
   - **COPIE ESTA URL COMPLETA**

### PASSO 3: Atualizar a URL nos Arquivos Locais

A URL que você copiou no PASSO 2 deve ser atualizada nos arquivos:

1. **`main.js`** (linha ~2):
   ```javascript
   const API_URL = 'COLE_A_URL_AQUI';
   ```

2. **`schedule.js`** (linha ~2):
   ```javascript
   const API_URL = window.KANBAN_API_URL || 'COLE_A_URL_AQUI';
   ```

3. **`dashboard.js`** (linha ~2-4):
   ```javascript
   const API_URL = typeof window !== 'undefined' && window.KANBAN_API_URL 
       ? window.KANBAN_API_URL 
       : 'COLE_A_URL_AQUI';
   ```

### PASSO 4: Atualizar Versões dos Arquivos HTML (para evitar cache)

Nos arquivos `index.html`, `schedule.html`, e `dashboard.html`, atualize as versões dos scripts:

```html
<!-- Exemplo em schedule.html -->
<script src="./schedule.js?v=20250131"></script>
```

### PASSO 5: Fazer Deploy no Netlify

1. Arraste a pasta do projeto para o Netlify
2. Aguarde o deploy finalizar
3. Abra o site no navegador

### PASSO 6: Testar

1. Abra o site no navegador
2. Pressione **F12** para abrir o console
3. Vá para a página de Cronograma
4. Tente adicionar um plantão
5. **Verifique o console:**
   - ✅ Se não aparecer erro CORS = Funcionou!
   - ❌ Se ainda aparecer erro CORS = Verifique o PASSO 2 novamente

## 🔍 Verificações Finais

Se ainda não funcionar, verifique:

1. ✅ O código do Google Apps Script foi atualizado?
2. ✅ A nova implantação foi feita?
3. ✅ "Quem tem acesso" está como "Qualquer pessoa, mesmo anônimo"?
4. ✅ A URL `/exec` foi copiada corretamente?
5. ✅ A URL foi atualizada nos 3 arquivos JS?
6. ✅ O deploy no Netlify foi feito após as alterações?

## 📝 Nota Técnica

O Google Apps Script gerencia headers CORS automaticamente quando:
- Está implantado como "Aplicativo da web" (não apenas script)
- Configurado como "Qualquer pessoa, mesmo anônimo"
- Usa `ContentService.createTextOutput()` (já está no código)

Não é necessário adicionar headers CORS manualmente - o Google Apps Script faz isso automaticamente quando configurado corretamente.





