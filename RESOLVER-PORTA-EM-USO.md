# 🔧 Resolver "EADDRINUSE: address already in use :::3001"

## ❌ Problema

A porta 3001 já está em uso por outro processo (provavelmente um processo "zombie" do PM2).

---

## ✅ Solução

```bash
# 1. Encontrar qual processo está usando a porta 3001
lsof -i :3001
# ou
netstat -tulpn | grep 3001

# 2. Ver PID do processo (exemplo: 444524)
# Matar o processo
kill -9 <PID>

# 3. Limpar PM2 completamente
pm2 kill
pm2 delete all

# 4. Verificar se porta está livre agora
netstat -tulpn | grep 3001

# 5. Reiniciar backend
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
pm2 status

# 6. Testar
sleep 3
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## 🔍 Comandos Rápidos

```bash
# Tudo de uma vez
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
pm2 kill
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
sleep 3
curl -X POST http://localhost:3001/pix -H "Content-Type: application/json" -d '{"amount": 10.00}'
```

---

**Execute os comandos para matar o processo e reiniciar!**

