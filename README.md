# Kanban Logística | MAGNABOSCO

Sistema de gerenciamento de tarefas e projetos baseado em Kanban, integrado com Google Sheets como banco de dados.

## 📋 Estado Atual do Projeto

**Versão:** 2.0  
**Última atualização:** 24/12/2025  
**Senha de acesso:** `magna25`

## 🚀 Funcionalidades Implementadas

### Autenticação
- Login com e-mail do domínio `@transmagnabosco.com.br`
- Senha universal: `magna25`
- Sistema de permissões baseado em e-mail:
  - **Acesso total** (criar, editar, deletar, mover): `maicon.amaral@transmagnabosco.com.br`, `maxsuel.salvador@transmagnabosco.com.br`
  - **Mover apenas próprios cards**: `kaua.andreis@transmagnabosco.com.br`, `mauricio.almeida@transmagnabosco.com.br`, `iago.spazzini@transmagnabosco.com.br`
  - **Somente visualização**: `lucas.bittencourt@transmagnabosco.com.br`, `guilherme.magnabosco@transmagnabosco.com.br`
- Upload de foto de perfil (persistente)
- Nome do usuário extraído do e-mail (primeiro nome antes do ponto)

### Kanban Board
- **4 Colunas de Status:**
  - Não Iniciado (Vermelho)
  - Em Andamento (Laranja)
  - Validação (Cinza)
  - Concluído (Verde)

- **Cards de Tarefas:**
  - Informações exibidas:
    - Título da tarefa (fonte maior, principal)
    - Nome do projeto (abaixo do título)
    - Setor
    - Responsável (com foto no canto superior direito)
    - Prioridade (Baixa/Média/Alta) com barra colorida
    - Data prevista de término
    - Dias restantes/atraso
    - Alertas de mudança de data (postergada/antecipada)
  - Botões de ação (editar/excluir) no canto inferior direito
  - Drag and drop para mover entre colunas (conforme permissões)
  - Cores e gradientes por status

- **Filtros:**
  - Por Projeto
  - Por Setor
  - Por Responsável
  - Sincronização com Dashboard

- **Novo Projeto:**
  - Múltiplas tarefas (até 10)
  - Múltiplos setores (até 10)
  - Múltiplos responsáveis (até 10)
  - Campo de prioridade
  - Datas de início e fim

### Menu Lateral (Sidebar)
- Estático na lateral esquerda
- Foto e nome do usuário no topo
- Botões:
  - Novo Projeto
  - Dashboard
- Filtros (Projeto, Setor, Responsável)
- Botão "Sair do Sistema" no rodapé

### Dashboard
- Cards de estatísticas:
  - Total de Projetos
  - Projetos Concluídos (100%)
  - Aderência de Conclusão (com cores dinâmicas)
- Gráficos:
  - Projetos Totais por Setor (barras)
  - Tarefas Concluídas por Responsável (barras)
  - Tarefas por Criticidade/Prioridade (linha)
  - Ranking de Projetos Finalizados por Responsável (barras horizontais)
- Filtros de data (início e fim)
- Sincronização com filtros do Kanban
- Rótulos de dados nos gráficos

## 📁 Estrutura de Arquivos

```
kanban-v2/
├── index.html              # Página principal (Kanban Board)
├── login.html              # Tela de login
├── main.js                 # Lógica principal do Kanban
├── style.css               # Estilos CSS
├── google-script.js        # Script Google Apps Script (para Google Sheets)
├── vercel.json             # Configuração para deploy no Vercel
├── ABRIR_LOCAL.html        # Arquivo auxiliar para acesso local
├── README.md               # Este arquivo
└── images/
    └── trucks-background.jpg  # Imagem de fundo do login
```

## 🔧 Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS e animações)
- JavaScript (Vanilla JS)
- Google Sheets (como banco de dados)
- Google Apps Script (API serverless)
- Chart.js (para gráficos no Dashboard)
- Ionicons (ícones)
- Fonte: Outfit (Google Fonts)

## 🌐 Deploy

### Vercel
O projeto está configurado para deploy no Vercel através do arquivo `vercel.json`.

### Local
Para executar localmente:

**Opção 1 - Abrir diretamente:**
```
file:///C:/Users/maicon%20John/kanban-v2/login.html
```

**Opção 2 - Servidor HTTP (Python):**
```bash
python -m http.server 8000
```
Acesse: `http://localhost:8000/login.html`

**Opção 3 - Servidor HTTP (Node.js):**
```bash
npx http-server -p 8000
```
Acesse: `http://localhost:8000/login.html`

## 🔐 Configuração de Acesso

### Login
- **Domínio:** `@transmagnabosco.com.br`
- **Senha:** `magna25`

### Permissões de Usuários
As permissões estão configuradas no arquivo `login.html` e `main.js`.

## 📊 Google Sheets

O projeto usa Google Sheets como banco de dados. É necessário:
1. Criar uma planilha no Google Sheets
2. Implementar o script `google-script.js` no Google Apps Script
3. Configurar a URL da API no arquivo `main.js` (variável `API_URL`)

## 🎨 Características de Design

- Tema escuro (preto e cinza)
- Cores dinâmicas baseadas em status
- Cards com gradientes e sombras
- Animações suaves
- Layout responsivo
- Menu lateral estático
- Tipografia moderna (Outfit)

## 📝 Notas Importantes

- As fotos de perfil são armazenadas no `localStorage` do navegador
- Os filtros são sincronizados entre Kanban e Dashboard via `localStorage`
- As permissões são baseadas no e-mail do usuário
- O sistema valida e formata datas automaticamente

## 🔄 Últimas Atualizações

- 24/12/2025: Senha alterada para `magna25`
- 24/12/2025: Correções no Dashboard
- 24/12/2025: Ajustes no layout dos cards
- 24/12/2025: Implementação do menu lateral estático
- 24/12/2025: Sistema de permissões baseado em e-mail

## 📞 Suporte

Para questões ou problemas, consulte a documentação do código ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido para:** Transmagnabosco  
**Sistema:** Kanban Logística | MAGNABOSCO








