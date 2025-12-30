# ✅ Verificar Porta e Testar

## Status Atual

✅ Servidor está rodando em `0.0.0.0:3001`  
❌ Ainda dando timeout ao conectar com API UmbrellaPag

---

## Comandos para Executar

```bash
# 1. Verificar porta de outra forma
ss -tulpn | grep 3001
# ou
lsof -i :3001

# 2. Testar localmente
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'

# 3. Se local funcionar, testar conectividade com API
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network

# 4. Ver logs em tempo real enquanto testa
pm2 logs projeto-pay-umbrela-backend --lines 0
# (Em outro terminal, fazer a requisição)
```

---

**Execute esses comandos e me diga o resultado!**

