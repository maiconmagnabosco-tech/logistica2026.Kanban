# 🚀 Passo a Passo: Enviar Projeto para GitHub

## ✅ PASSO 1: Criar Repositório no GitHub

1. **Abra seu navegador** e acesse: **https://github.com/new**

2. **Preencha os campos**:
   - **Repository name**: `logistica-2026` (ou outro nome que preferir)
   - **Description**: `Sistema Kanban com Cronograma e Dashboard`
   - **Visibility**: 
     - ✅ Marque **Public** (qualquer um pode ver)
     - OU marque **Private** (só você pode ver)
   - ⚠️ **NÃO marque** a opção "Add a README file" (já temos um)
   - ⚠️ **NÃO marque** "Add .gitignore" (já temos um)
   - ⚠️ **NÃO marque** "Choose a license"

3. **Clique no botão verde**: **"Create repository"**

4. **Copie a URL** que aparecerá na próxima tela (você vai precisar dela no próximo passo)
   - Será algo como: `https://github.com/maiconmagnabosco-tech/logistica-2026.git`

---

## ✅ PASSO 2: Conectar e Enviar para GitHub

**Abra o PowerShell ou Terminal** na pasta do projeto e execute os comandos abaixo **UM POR VEZ**:

### Comando 1: Conectar ao repositório remoto
```powershell
git remote add origin https://github.com/maiconmagnabosco-tech/logistica-2026.git
```

### Comando 2: Renomear branch para main (padrão do GitHub)
```powershell
git branch -M main
```

### Comando 3: Enviar código para GitHub
```powershell
git push -u origin main
```

**⚠️ IMPORTANTE**: 
- Se pedir **usuário**: digite `maiconmagnabosco-tech`
- Se pedir **senha**: NÃO use sua senha do GitHub!
  - Use um **Personal Access Token** (veja instruções abaixo se necessário)

---

## ✅ PASSO 3: Verificar se Funcionou

Execute este comando para verificar:
```powershell
git remote -v
```

Você deve ver algo como:
```
origin  https://github.com/maiconmagnabosco-tech/logistica-2026.git (fetch)
origin  https://github.com/maiconmagnabosco-tech/logistica-2026.git (push)
```

**Acesse**: https://github.com/maiconmagnabosco-tech/logistica-2026
**Você deve ver todos os seus arquivos lá!** 🎉

---

## 🔐 Se Pedir Senha (Personal Access Token)

Se o GitHub pedir senha, você precisa criar um **Personal Access Token**:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `Logistica 2026`
4. Marque as permissões:
   - ✅ `repo` (todas as opções)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá ele uma vez!)
7. Quando pedir senha, **cole o token** (não sua senha normal)

---

## 📋 Resumo dos Comandos (Copie e Cole)

```powershell
cd "C:\Users\maicon John\Logistica 2026"
git remote add origin https://github.com/maiconmagnabosco-tech/logistica-2026.git
git branch -M main
git push -u origin main
```

---

## ✅ Pronto!

Depois disso, seu código estará no GitHub e você poderá:
- Ver online em: https://github.com/maiconmagnabosco-tech/logistica-2026
- Conectar ao Vercel para fazer deploy
- Compartilhar com outros desenvolvedores

**Qualquer dúvida, me avise!** 🚀

