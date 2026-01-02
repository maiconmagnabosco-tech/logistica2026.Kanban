# 📊 Como os Dados São Compartilhados

## ✅ Como Funciona

### Arquitetura

```
Usuário 1 → Site Online → Google Apps Script → Google Sheets
Usuário 2 → Site Online → Google Apps Script → Google Sheets (MESMA PLANILHA)
Usuário 3 → Site Online → Google Apps Script → Google Sheets (MESMA PLANILHA)
```

**Todos usam a mesma planilha!** Por isso todos veem os mesmos dados.

---

## 🔄 Fluxo de Dados

### 1. Quando um Usuário Cria uma Tarefa

1. Usuário preenche o formulário
2. Clica em "Salvar"
3. Dados são enviados para Google Apps Script
4. Google Apps Script salva na planilha
5. **Todos os outros usuários** veem a tarefa ao recarregar

### 2. Quando um Usuário Salva um Plantão

1. Usuário preenche o formulário
2. Clica em "Salvar"
3. Dados são enviados para Google Apps Script
4. Google Apps Script salva na planilha
5. **Todos os outros usuários** veem o plantão ao recarregar

### 3. Quando um Usuário Move uma Tarefa (Drag & Drop)

1. Usuário arrasta tarefa para outra coluna
2. Dados são enviados para Google Apps Script
3. Google Apps Script atualiza na planilha
4. **Todos os outros usuários** veem a mudança ao recarregar

---

## ⚠️ Importante: Atualização em Tempo Real

### Como Funciona Atualmente

- ❌ **NÃO é em tempo real** (não atualiza automaticamente)
- ✅ **Atualiza ao recarregar** a página (F5)
- ✅ **Atualiza ao criar/editar** algo (recarrega automaticamente)

### Para Ver Mudanças de Outros Usuários

1. **Recarregue a página** (F5 ou Ctrl+R)
2. Os dados serão buscados novamente da planilha
3. Você verá todas as mudanças feitas por outros usuários

---

## 🧪 Como Testar se Está Funcionando

### Teste 1: Dois Usuários

1. **Usuário 1:**
   - Acesse o site
   - Faça login
   - Crie uma tarefa: "Teste Compartilhamento"
   - Salve

2. **Usuário 2 (outro navegador ou aba anônima):**
   - Acesse o mesmo site
   - Faça login
   - **Recarregue a página** (F5)
   - **Deve ver a tarefa "Teste Compartilhamento"**

Se ambos veem a mesma tarefa = ✅ Funcionando!

### Teste 2: Plantão

1. **Usuário 1:**
   - Vá para Cronograma
   - Crie um plantão
   - Salve

2. **Usuário 2:**
   - Vá para Cronograma
   - **Recarregue a página** (F5)
   - **Deve ver o plantão criado pelo Usuário 1**

---

## 📋 O Que É Compartilhado

### ✅ Compartilhado (Todos Veem):
- ✅ Tarefas do Kanban
- ✅ Projetos
- ✅ Reuniões no cronograma
- ✅ Eventos no cronograma
- ✅ Plantões no cronograma
- ✅ Folgas no cronograma
- ✅ Anotações de reuniões

### ❌ NÃO Compartilhado (Individual):
- ❌ Foto de perfil (salva no navegador local)
- ❌ Filtros selecionados (salvos no navegador local)
- ❌ Preferências do usuário (salvas no navegador local)

---

## 🔧 Como Melhorar (Opcional)

### Atualização Automática

Se quiser que atualize automaticamente sem recarregar:

1. Adicionar polling (buscar dados a cada X segundos)
2. Implementar WebSockets (mais complexo)
3. Usar Server-Sent Events (SSE)

**Por enquanto, recarregar a página funciona perfeitamente!**

---

## ✅ Resumo

- ✅ **Todos os dados são compartilhados** (mesma planilha)
- ✅ **Todos os usuários veem as mesmas informações**
- ✅ **Mudanças aparecem ao recarregar a página**
- ✅ **Funciona perfeitamente para equipes**

---

**Status:** ✅ Funcionando corretamente!

