# 📋 Lista de Usuários e Senhas para Testes

## 🔐 Informações de Login

**Senhas Individuais:** Cada usuário tem sua própria senha  
**Domínio Permitido:** `@transmagnabosco.com.br`

---

## 👥 Usuários Cadastrados

### 1. Acesso Total (Full Access)
**Permissões:** Criar, editar, deletar e mover todos os cards

| Email | Nome | Senha | Permissão |
|-------|------|-------|-----------|
| `maicon.amaral@transmagnabosco.com.br` | Maicon | `M@na21` | `full` |
| `maxsuel.salvador@transmagnabosco.com.br` | Maxsuel | `M@gna11` | `full` |
| `lucas.bittencourt@transmagnabosco.com.br` | Lucas | `M@gna09` | `full` |
| `guilherme.magnabosco@transmagnabosco.com.br` | Guilherme | `M@gna041023` | `full` |

---

### 2. Mover Apenas Próprios Cards
**Permissões:** Visualizar tudo, mas pode mover apenas cards onde é o responsável

| Email | Nome | Senha | Permissão |
|-------|------|-------|-----------|
| `kaua.andreis@transmagnabosco.com.br` | Kaua | `M@gna10` | `move_own` |
| `mauricio.almeida@transmagnabosco.com.br` | Mauricio | `M@gna33` | `move_own` |
| `iago.spazzini@transmagnabosco.com.br` | Iago | `M@gna99` | `move_own` |

---

## 🧪 Exemplos de Teste

### Teste com Acesso Total:
```
Email: maicon.amaral@transmagnabosco.com.br
Senha: M@na21
```
✅ Deve poder criar, editar, deletar e mover qualquer card

---

### Teste com Acesso Limitado:
```
Email: kaua.andreis@transmagnabosco.com.br
Senha: M@gna10
```
✅ Deve poder visualizar tudo, mas mover apenas cards próprios  
❌ Não deve poder criar, editar ou deletar cards

---

### Teste com Acesso Total (Lucas):
```
Email: lucas.bittencourt@transmagnabosco.com.br
Senha: M@gna09
```
✅ Deve poder criar, editar, deletar e mover qualquer card

---

## 📝 Notas Importantes

1. **Cada usuário tem sua própria senha individual**
2. **O email deve ser exatamente como está na lista** (case-insensitive, mas o domínio deve ser `@transmagnabosco.com.br`)
3. **Se o email não estiver na lista**, o sistema dará acesso `view_only` (somente visualização) por padrão
4. **As permissões são verificadas no frontend** (arquivo `auth-config.js`)
5. **Senhas são case-sensitive** (diferencia maiúsculas e minúsculas)

---

## 🔍 Onde Está Configurado?

- **Arquivo:** `auth-config.js`
- **Variável:** `USER_PERMISSIONS` (contém email, nome, senha e permissão)
- **Domínio:** `AUTH_DOMAIN = '@transmagnabosco.com.br'`
- **Função de validação:** `validateUserPassword(email, password)`

---

**Última atualização:** Baseado no arquivo `auth-config.js` atual

