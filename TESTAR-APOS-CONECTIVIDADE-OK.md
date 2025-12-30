# ✅ Testar Após Conectividade OK

## Status

✅ Teste de conectividade passou (1992ms, status 200)  
✅ API UmbrellaPag está acessível agora

---

## Comandos para Executar na VPS

```bash
# 1. Reiniciar backend para garantir que está usando a conectividade atual
pm2 restart projeto-pay-umbrela-backend --update-env

# 2. Aguardar alguns segundos
sleep 5

# 3. Testar endpoint localmente
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'

# 4. Se funcionar localmente, testar via IP público
curl -X POST http://24.152.36.55:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## Se Ainda Der Timeout

Pode ser que o servidor precise de um restart completo:

```bash
# Parar tudo
pm2 kill
pm2 delete all

# Reiniciar
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save

# Aguardar
sleep 5

# Testar
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

**Execute os comandos e teste novamente!**

