# 🚀 DEPLOY NO VERCEL - GUIA RÁPIDO

## ⚡ Forma Mais Rápida (Recomendada)

### Opção 1: Usar o Script Automático

1. **Duplo clique** no arquivo: `DEPLOY_VERCEL_RAPIDO.bat`
2. Escolha opção **1** (Deploy para PRODUÇÃO)
3. Pronto! ✅

---

### Opção 2: Manual (Via Terminal)

#### 1️⃣ Instalar Vercel CLI (apenas primeira vez)

Abra o PowerShell na pasta do projeto e execute:

```bash
npm install -g vercel
```

#### 2️⃣ Fazer Login (apenas primeira vez)

```bash
vercel login
```

(Vai abrir o navegador para login)

#### 3️⃣ Fazer Deploy

**Primeira vez:**
```bash
vercel
```
(Siga as perguntas - digite N para "Link to existing project?")

**Próximas vezes:**
```bash
vercel --prod
```

---

## ✅ Pronto!

Seu site estará online em segundos!

URL será algo como: `https://kanban-v2.vercel.app`

---

## 📖 Guia Completo

Para mais detalhes, veja: `DEPLOY_VERCEL_SEM_GITHUB.md`



