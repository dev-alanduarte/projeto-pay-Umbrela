# 🚀 Guia para Subir Código no GitHub

## 📋 Passo a Passo

### 1. Verificar Status
```bash
git status
```

### 2. Adicionar Arquivos Modificados
```bash
# Adiciona todos os arquivos modificados e novos
git add .

# Ou adiciona arquivos específicos:
git add backend/src/server.js
git add frontend/page.html
git add backend/src/umbrella-deposit-edge-function.js
```

### 3. Fazer Commit (Salvar as Mudanças)
```bash
git commit -m "feat: adiciona geração de QR code PIX com rotação de CPF e dados aleatórios"
```

**Dicas de mensagens de commit:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Documentação
- `chore:` - Tarefas de manutenção

### 4. Verificar Remote (Repositório no GitHub)
```bash
git remote -v
```

### 5. Fazer Push (Enviar para o GitHub)
```bash
# Se estiver na branch main
git push origin main

# Ou se o remote se chama diferente
git push umbrela main
```

### 6. Se Der Erro de Conflito
```bash
# Puxa as mudanças do GitHub primeiro
git pull origin main

# Resolve conflitos se houver, depois:
git add .
git commit -m "merge: resolve conflitos"
git push origin main
```

---

## 🔐 Primeira Vez no GitHub?

### Criar Repositório no GitHub:
1. Acesse: https://github.com/new
2. Nome do repositório: `checkout-agilize` (ou o nome que preferir)
3. Escolha: **Private** ou **Public**
4. **NÃO** marque "Initialize with README" (já temos código)
5. Clique em **Create repository**

### Conectar Repositório Local ao GitHub:
```bash
# Se ainda não tiver remote configurado
git remote add origin https://github.com/SEU_USUARIO/checkout-agilize.git

# Ou via SSH (se tiver chave configurada)
git remote add origin git@github.com:SEU_USUARIO/checkout-agilize.git
```

### Autenticação:
- **HTTPS**: Vai pedir usuário e senha (ou token)
- **SSH**: Precisa configurar chave SSH antes

---

## 📝 Comandos Rápidos

```bash
# Ver o que mudou
git status

# Adicionar tudo
git add .

# Salvar mudanças
git commit -m "sua mensagem aqui"

# Enviar para GitHub
git push origin main

# Ver histórico
git log --oneline

# Desfazer última mudança (antes de commit)
git restore arquivo.js

# Desfazer commit (mantém mudanças)
git reset --soft HEAD~1
```

---

## ⚠️ Arquivos que NÃO vão para o GitHub

O arquivo `.gitignore` já está configurado para **NÃO** enviar:
- ✅ `node_modules/` (dependências)
- ✅ `.env` (variáveis de ambiente - **IMPORTANTE!**)
- ✅ `*.log` (logs)
- ✅ Arquivos temporários

**NUNCA** commite arquivos `.env` com senhas/tokens!

---

## 🎯 Próximos Passos Após Push

1. **Criar README.md** explicando o projeto
2. **Adicionar .env.example** (template sem valores reais)
3. **Configurar GitHub Actions** (se precisar CI/CD)
4. **Adicionar licença** (se quiser)

