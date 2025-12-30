# ✅ Teste na VPS

## Status dos Serviços

✅ Backend rodando em: `http://localhost:3001`
✅ Frontend rodando em: `http://127.0.0.1:3000`

## Testar Rota /pix

```bash
# Teste básico
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

## Verificar Logs em Tempo Real

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 30

# Ver logs do frontend
pm2 logs projeto-pay-umbrela-frontend --lines 30

# Ver todos os logs
pm2 logs --lines 30
```

## Comandos Úteis

```bash
# Ver status
pm2 status

# Reiniciar
pm2 restart all

# Parar
pm2 stop all

# Ver informações detalhadas
pm2 describe projeto-pay-umbrela-backend
pm2 describe projeto-pay-umbrela-frontend
```

