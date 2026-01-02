# 🔓 Configurar Acesso Público ao Google Apps Script

## ⚠️ IMPORTANTE: Para que TODOS os usuários possam acessar de suas máquinas

### Passo 1: Configurar Permissões do Google Apps Script

1. **Abra o Google Apps Script** (script.google.com)
2. **Vá no seu projeto** (o script do Kanban)
3. **Clique no ícone de engrenagem (⚙️) no canto superior direito** → **"Configurações do projeto"**
4. **Na seção "Executar como"**, certifique-se de que está:
   - ✅ **"Executar como: Eu"** (seu email)
5. **Na seção "Quem tem acesso ao app"**, configure:
   - ✅ **"Quem tem acesso ao app: Qualquer pessoa"** (ou "Qualquer pessoa com o link")
   - ✅ Isso permite que qualquer pessoa acesse a API sem autenticação

### Passo 2: Publicar como Web App

1. **No Google Apps Script**, clique em **"Publicar"** → **"Implantar como aplicativo da web"**
2. **Configure:**
   - **Versão:** "Nova"
   - **Executar como:** "Eu (seu email)"
   - **Quem tem acesso:** **"Qualquer pessoa, mesmo anônimo"** ← **MUITO IMPORTANTE!**
3. **Clique em "Implantar"**
4. **Copie a URL gerada** (será algo como: `https://script.google.com/macros/s/.../exec`)

### Passo 3: Atualizar a URL no Código Frontend

1. **Abra o arquivo `schedule.js`** (ou `main.js`)
2. **Procure pela linha:**
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/.../exec';
   ```
3. **Substitua pela URL que você copiou no Passo 2**

### Passo 4: Verificar CORS

O Google Apps Script gerencia CORS automaticamente quando configurado como público. O código já está preparado para aceitar requisições de qualquer origem.

### Passo 5: Testar

1. **Abra o Kanban em uma máquina diferente** (ou navegador anônimo)
2. **Verifique se consegue:**
   - ✅ Ver tarefas
   - ✅ Ver cronograma
   - ✅ Criar eventos/reuniões/plantões
   - ✅ Salvar alterações

### 🔧 Se Não Funcionar

**Problema: "Access-Control-Allow-Origin"**
- ✅ Verifique se configurou "Qualquer pessoa, mesmo anônimo" no Passo 2
- ✅ Verifique se a URL da API está correta no frontend

**Problema: "401 Unauthorized"**
- ✅ Verifique se configurou "Executar como: Eu" no Passo 1
- ✅ Verifique se deu permissões adequadas à planilha

**Problema: "403 Forbidden"**
- ✅ Verifique se a planilha está compartilhada (pode ser "Qualquer pessoa com o link")
- ✅ Verifique se o script tem permissões para acessar a planilha

### 📝 Nota sobre API Key

A API Key do Google Cloud (`AIzaSyDrg0PNmgX8RTq9d_eG16kOMls0t4Biykw`) **NÃO é necessária** para o Google Apps Script funcionar como Web App público. Ela só seria necessária se você estivesse usando a Google Sheets API diretamente, mas como estamos usando Apps Script, não precisa.

### ✅ Checklist Final

- [ ] Script configurado como "Executar como: Eu"
- [ ] Script publicado como "Qualquer pessoa, mesmo anônimo"
- [ ] URL da API atualizada no frontend
- [ ] Planilha compartilhada (se necessário)
- [ ] Testado em máquina diferente







