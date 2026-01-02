# 🔄 RECUPERAR DADOS PERDIDOS DO CRONOGRAMA

## ⚠️ URGENTE: Recuperar Dados do Histórico do Google Sheets

O Google Sheets mantém um histórico automático de versões. **É MUITO PROVÁVEL que seus dados ainda estejam lá!**

### 📋 Passo 1: Acessar Histórico de Versões

1. **Abra sua planilha do Google Sheets no navegador**
2. **Clique no menu "Arquivo"** (no topo)
3. **Clique em "Histórico de versões"**
4. **Clique em "Ver histórico de versões"**

### 🔍 Passo 2: Encontrar Versão com Dados

1. **Procure por uma versão ANTES de você atualizar o código do Google Apps Script**
2. **As versões aparecem com data e hora**
3. **Clique na versão que tem os dados do cronograma**

### 📥 Passo 3: Restaurar Dados

**Opção A - Restaurar Versão Completa:**
1. Na versão antiga, clique em **"Restaurar esta versão"** (botão no topo)
2. Isso vai restaurar toda a planilha para aquela versão
3. **CUIDADO:** Isso pode desfazer outras mudanças feitas depois

**Opção B - Copiar Apenas os Dados do Cronograma:**
1. Na versão antiga, vá na aba **"Cronograma"**
2. **Selecione todas as células** (clique no canto superior esquerdo ou Ctrl+A)
3. **Copie** (Ctrl+C)
4. **Volte para a versão atual** (clique em "Voltar" ou feche o histórico)
5. **Vá na aba "Cronograma"** da versão atual
6. **Cole os dados** (Ctrl+V)

### 🔎 Passo 4: Verificar Estrutura dos Dados

A aba "Cronograma" deve ter estas colunas na primeira linha:
- **Coluna A:** data (reuniões)
- **Coluna B:** titulo (reuniões)
- **Coluna C:** hora (reuniões)
- **Coluna D:** anotacoes (reuniões)
- **Coluna E:** data (eventos)
- **Coluna F:** nome (eventos)
- **Coluna G:** data_fim (eventos)
- **Coluna H:** is_end_event (eventos)
- **Coluna I:** is_folga (eventos)
- **Coluna J:** person (eventos)
- **Coluna K:** plantao_start_date (eventos)
- **Coluna L:** data_inicio (plantões)
- **Coluna M:** data_fim (plantões)
- **Coluna N:** person (plantões)

### 🛡️ Prevenção para o Futuro

O código foi atualizado com:
- ✅ **Merge inteligente:** Preserva dados existentes ao salvar
- ✅ **Validação:** Não apaga se não tiver todos os dados
- ✅ **Logs:** Registra o que está sendo salvo para debug
- ✅ **Tratamento de erros:** Não falha silenciosamente

### 📞 Se Não Conseguir Recuperar

Se os dados não estiverem no histórico:
1. Verifique se há backup em outro lugar
2. Verifique se os dados estão em outra aba
3. Infelizmente, será necessário recriar manualmente

**Mas agora o código está seguro e isso NÃO deve acontecer novamente!**

