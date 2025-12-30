# 🚀 Comandos para Executar na VPS

## 📋 Atualizar o Código

Execute estes comandos na VPS:

```bash
# 1. Voltar para a raiz do projeto
cd ~/projeto-pay-Umbrela

# 2. Verificar status atual
git status

# 3. Puxar as mudanças do GitHub
git pull umbrela main

# 4. Verificar se o arquivo novo apareceu
ls backend/src/

# 5. Instalar dependências (se necessário)
cd backend
npm install --production
cd ..

# 6. Reiniciar o servidor PM2
pm2 restart ecosystem.config.js

# 7. Verificar se está funcionando
pm2 status
pm2 logs --lines 30
```

---

## 🔍 Verificar se Atualizou

Depois do `git pull`, você deve ver:
- ✅ `backend/src/umbrella-deposit-edge-function.js` (novo arquivo)
- ✅ `backend/src/server.js` (atualizado)
- ✅ `frontend/page.html` (atualizado)
- ❌ `backend/src/umbrellapagClient.js` (deletado)

---

## 🐛 Se Der Erro

### Erro: "Your local changes would be overwritten"
```bash
# Salvar mudanças locais
git stash

# Puxar mudanças
git pull umbrela main

# Se quiser aplicar mudanças locais de volta
git stash pop
```

### Erro: "Permission denied"
```bash
# Verificar permissões
ls -la backend/src/

# Se necessário, corrigir
chmod 644 backend/src/*.js
```

