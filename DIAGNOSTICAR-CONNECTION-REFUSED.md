# 🔍 Diagnosticar "Connection Refused" com PM2 Online

## ❌ Problema

PM2 mostra backend como "online", mas `curl` retorna "Connection refused".

**Isso geralmente significa que o processo está crashando imediatamente após iniciar.**

---

## 🔍 Diagnóstico

```bash
# 1. Ver logs de erro (MUITO IMPORTANTE)
pm2 logs projeto-pay-umbrela-backend --err --lines 50

# 2. Ver logs de saída
pm2 logs projeto-pay-umbrela-backend --lines 50

# 3. Ver informações detalhadas
pm2 describe projeto-pay-umbrela-backend

# 4. Verificar se processo realmente está rodando
ps aux | grep node | grep 3001
```

---

## ✅ Solução Rápida

```bash
# 1. Parar backend
pm2 stop projeto-pay-umbrela-backend

# 2. Deletar processo
pm2 delete projeto-pay-umbrela-backend

# 3. Verificar se porta está livre
netstat -tulpn | grep 3001

# 4. Se houver processo, matar
# (substitua <PID> pelo número)
# kill -9 <PID>

# 5. Testar se código inicia manualmente
cd ~/projeto-pay-Umbrela/backend
node src/server.js
# (Vai mostrar o erro real - pare com Ctrl+C)

# 6. Se der erro, corrigir e depois reiniciar com PM2
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
```

---

## 🐛 Erros Comuns

### ❌ Erro de Sintaxe

**Solução:** Verificar logs de erro:
```bash
pm2 logs projeto-pay-umbrela-backend --err
```

### ❌ Porta já em uso

**Solução:**
```bash
# Ver o que está usando a porta
lsof -i :3001
# Matar processo
kill -9 <PID>
```

### ❌ Variável de ambiente faltando

**Solução:**
```bash
# Verificar .env
cat ~/projeto-pay-Umbrela/backend/.env

# Reiniciar com --update-env
pm2 restart projeto-pay-umbrela-backend --update-env
```

---

**Execute `pm2 logs projeto-pay-umbrela-backend --err --lines 50` e me mostre o resultado!**

