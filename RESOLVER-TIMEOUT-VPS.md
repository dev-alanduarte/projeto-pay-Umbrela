# ⏱️ Resolver Timeout na Rota /pix

## Problema: Requisição trava e dá timeout

### 1. Ver logs em tempo real
```bash
pm2 logs projeto-pay-umbrela-backend --lines 50
```

### 2. Verificar se a API UmbrellaPag está acessível
```bash
# Testar conectividade
curl -I https://api-gateway.umbrellapag.com/api/user/transactions
```

### 3. Verificar variável de ambiente
```bash
cd backend
cat .env | grep UMBRELLAPAG_API_KEY
```

### 4. Testar com timeout menor
```bash
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}' \
  --max-time 30
```

### 5. Verificar se há firewall bloqueando
```bash
# Ver se a porta está aberta
netstat -tulpn | grep :3001
```

---

## Possíveis Causas

### 1. API UmbrellaPag não responde
- Verificar se a API está online
- Verificar se a chave API está correta
- Verificar logs para ver se a requisição está sendo feita

### 2. Problema de rede/firewall
- A VPS pode não conseguir acessar a API externa
- Verificar configurações de firewall

### 3. Código travando
- Verificar se há algum loop infinito
- Verificar se há await sem timeout

---

## Solução: Adicionar Timeout na Requisição

Se a API UmbrellaPag estiver demorando muito, podemos adicionar um timeout na requisição fetch.

---

## Debug Passo a Passo

```bash
# 1. Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend --lines 100

# 2. Em outro terminal, fazer a requisição
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'

# 3. Observar os logs para ver onde trava
```

---

## Verificar se o servidor está processando

```bash
# Ver processos Node.js
ps aux | grep node

# Ver uso de CPU/memória
top -p $(pgrep -f "node src/server.js")
```

