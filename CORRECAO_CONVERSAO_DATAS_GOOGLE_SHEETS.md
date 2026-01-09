# 🔧 Correção da Conversão de Datas no Google Sheets

## ❌ Problema Identificado

O Google Sheets armazena datas como **números seriais** (dias desde 1900-01-01), e a função de conversão anterior não estava tratando isso corretamente.

### Como o Google Sheets Armazena Datas:

- **Número Serial**: 1 = 1900-01-01, 2 = 1900-01-02, etc.
- **Exemplo**: 31 de dezembro de 2024 = aproximadamente 45386 (dias desde 1900-01-01)
- **Bug Histórico**: Google Sheets considera 1900 como ano bissexto (não é), então há um ajuste de 1 dia

## ✅ Correção Implementada

### Função `formatDateKey()` Corrigida

A função agora:

1. **Detecta números seriais** do Google Sheets (entre 1 e 100000)
2. **Converte corretamente** para JavaScript Date:
   - Fórmula: `(serial - 1 - 25569) * 86400000`
   - Onde 25569 = dias entre 1900-01-01 e 1970-01-01
3. **Formata para YYYY-MM-DD** para uso no frontend
4. **Mantém compatibilidade** com strings e objetos Date

### Melhorias Adicionais:

- ✅ Conversão de `endDate` em eventos
- ✅ Conversão de `plantaoStartDate` em eventos
- ✅ Conversão de `endDate` em plantões
- ✅ Validação de strings já no formato YYYY-MM-DD (retorna direto)

## 📋 O Que Foi Alterado

### 1. Função `formatDateKey()` (linhas ~293-314)

**Antes:**
```javascript
function formatDateKey(dateValue) {
    if (!dateValue) return '';
    let date;
    if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
    } else {
        return String(dateValue);
    }
    // ... formatação
}
```

**Depois:**
```javascript
function formatDateKey(dateValue) {
    if (!dateValue) return '';
    
    let date;
    
    // Se for um número (serial do Google Sheets)
    if (typeof dateValue === 'number') {
        if (dateValue >= 1 && dateValue <= 100000) {
            // Converter número serial para JavaScript Date
            const daysSince1900 = dateValue - 1;
            const daysSince1970 = daysSince1900 - 25569;
            const millisecondsSince1970 = daysSince1970 * 86400000;
            date = new Date(millisecondsSince1970);
        } else {
            date = new Date(dateValue);
        }
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'string') {
        // Se já estiver em YYYY-MM-DD, retornar direto
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
            return dateValue.trim();
        }
        date = new Date(dateValue);
    }
    
    // ... formatação para YYYY-MM-DD
}
```

### 2. Função `getCronograma()` (linhas ~427-456)

**Antes:**
```javascript
events[dateKey] = {
    date: dateKey,
    name: row[5] || '',
    endDate: row[6] || '',  // ❌ Não convertia
    // ...
    plantaoStartDate: row[10] || '',  // ❌ Não convertia
    // ...
};
```

**Depois:**
```javascript
events[dateKey] = {
    date: dateKey,
    name: row[5] || '',
    endDate: row[6] ? formatDateKey(row[6]) : '',  // ✅ Converte
    // ...
    plantaoStartDate: row[10] ? formatDateKey(row[10]) : '',  // ✅ Converte
    // ...
};
```

## 🧪 Como Testar

### 1. Teste de Conversão de Data Serial

1. Acesse o Google Sheets
2. Digite uma data manualmente (ex: 31/12/2024)
3. Veja o número serial na célula (deve ser ~45386)
4. No sistema, a data deve aparecer como "2024-12-31"

### 2. Teste de Leitura de Datas

1. Crie um plantão no cronograma
2. Salve
3. Recarregue a página (F5)
4. Verifique se a data aparece corretamente (não como "Invalid Date")

### 3. Teste de Datas em Eventos

1. Crie um evento com data de início e fim
2. Salve
3. Recarregue a página
4. Verifique se ambas as datas aparecem corretamente

## 📝 Próximos Passos

1. **Copiar o código atualizado** para o Google Apps Script
2. **Fazer uma nova implantação** do script
3. **Testar** criando/recarregando plantões e eventos
4. **Verificar** se as datas aparecem corretamente

## ⚠️ Importante

- **Sempre use o formato YYYY-MM-DD** ao salvar datas no frontend
- O Google Sheets pode converter automaticamente strings de data para números seriais
- A função `formatDateKey()` agora trata todos os formatos corretamente

## 🔄 Compatibilidade

A correção mantém compatibilidade com:
- ✅ Strings de data (ex: "2024-12-31")
- ✅ Objetos Date do JavaScript
- ✅ Números seriais do Google Sheets
- ✅ Timestamps Unix (milissegundos)

---

**Status:** ✅ Correção implementada e pronta para uso!


