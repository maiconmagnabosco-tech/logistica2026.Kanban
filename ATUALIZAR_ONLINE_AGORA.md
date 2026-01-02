# 🚀 Atualizar Versão Online - Guia Rápido

## ⚡ OPÇÃO MAIS RÁPIDA: Vercel CLI

### Método 1: Usar Script Automático (Recomendado)

1. **Dê duplo clique** no arquivo: **`DEPLOY_VERCEL.bat`**
2. Aguarde o deploy completar (1-2 minutos)
3. ✅ **Pronto!** Versão atualizada online!

---

### Método 2: Pelo Terminal

1. Abra o **PowerShell** ou **Prompt de Comando**
2. Navegue até a pasta:
   ```bash
   cd "C:\Users\maicon John\kanban-v2"
   ```
3. Execute:
   ```bash
   vercel --prod
   ```
4. Se pedir login, execute primeiro:
   ```bash
   vercel login
   ```
5. Aguarde completar
6. ✅ **Pronto!**

---

## 🌐 OPÇÃO ALTERNATIVA: Netlify Drop

### Se você usa Netlify ou prefere arrastar e soltar:

1. **Compactar a pasta:**
   - Vá até: `C:\Users\maicon John\kanban-v2`
   - Selecione **TODOS os arquivos** (Ctrl+A)
   - Clique com botão direito → **Enviar para** → **Pasta compactada (zip)**
   - Será criado `kanban-v2.zip`

2. **Fazer upload:**
   - Acesse: https://app.netlify.com/drop
   - Faça login
   - **Arraste** o arquivo `kanban-v2.zip` para a área indicada

3. **Aguardar:**
   - Aguarde o upload e deploy (2-3 minutos)

4. ✅ **Pronto!** Versão atualizada!

---

## 📝 O que será atualizado:

✅ **Nova funcionalidade de Cronograma**
✅ **Calendário com datas de entrega (roxo)**
✅ **Sistema de reuniões (cinza claro)**
✅ **Bloco de anotações (Ata da Reunião)**
✅ **Geração de PDF das atas**
✅ **Ícones de pessoas e check nos dias**
✅ **Senhas individuais atualizadas**
✅ **Permissões atualizadas**

---

## ⏱️ Tempo Estimado

- **Vercel CLI:** 1-2 minutos
- **Netlify Drop:** 2-3 minutos

---

## 🔍 Verificar se Funcionou

Após o deploy:

1. Acesse seu site online
2. Clique em **"Cronograma"** no menu lateral
3. Verifique se o calendário aparece
4. Teste criar uma reunião e anotações
5. ✅ Se funcionar, está tudo certo!

---

**Importante:** Todos os arquivos novos (`schedule.html`, `schedule.js` e as alterações em `index.html`, `main.js` e `style.css`) serão enviados no deploy!










