# ✅ Verificar Status do Backend

## 🔍 Status Atual

A porta 3001 está em uso pelo processo Node.js (PID 444038), o que significa que o backend está rodando.

---

## 📋 Comandos para Verificar

```bash
# 1. Ver status do PM2
pm2 status

# 2. Ver informações detalhadas do backend
pm2 describe projeto-pay-umbrela-backend

# 3. Ver logs recentes
pm2 logs projeto-pay-umbrela-backend --lines 20

# 4. Testar endpoint
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## ✅ Se Backend Estiver Online no PM2

```bash
# Apenas testar
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## 🔄 Se Backend Não Estiver no PM2 (mas porta em uso)

```bash
# Ver qual processo está usando a porta
ps aux | grep 444038

# Se for um processo antigo, matar e reiniciar com PM2
kill -9 444038
cd ~/projeto-pay-Umbrela
pm2 restart projeto-pay-umbrela-backend
```

---

**Execute `pm2 status` e `curl` para testar!**

