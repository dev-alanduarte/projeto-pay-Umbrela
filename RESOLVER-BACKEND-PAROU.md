# 🔧 Backend Parou - Como Resolver

## 🔍 Diagnóstico Rápido

```bash
# 1. Verificar status do PM2
pm2 status

# 2. Ver logs do backend (últimas 50 linhas)
pm2 logs projeto-pay-umbrela-backend --lines 50

# 3. Ver apenas erros
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

---

## ✅ Solução Rápida

```bash
# 1. Reiniciar backend
pm2 restart projeto-pay-umbrela-backend

# 2. Aguardar alguns segundos
sleep 3

# 3. Verificar status
pm2 status

# 4. Testar se está funcionando
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## 🔄 Se Reiniciar Não Funcionar

```bash
# 1. Parar backend
pm2 stop projeto-pay-umbrela-backend

# 2. Deletar processo
pm2 delete projeto-pay-umbrela-backend

# 3. Verificar se porta 3001 está livre
netstat -tulpn | grep 3001

# 4. Se houver processo na porta, matar
# (substitua <PID> pelo número que aparecer)
# kill -9 <PID>

# 5. Reiniciar do zero
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## 🐛 Verificar Erros Comuns

### ❌ Erro de Memória

```bash
# Ver uso de memória
pm2 monit

# Se estiver alto, aumentar limite no ecosystem.config.js
```

### ❌ Erro de Porta em Uso

```bash
# Ver o que está usando porta 3001
lsof -i :3001
# ou
netstat -tulpn | grep 3001

# Matar processo se necessário
kill -9 <PID>
```

### ❌ Erro de Código/Sintaxe

```bash
# Ver logs de erro
pm2 logs projeto-pay-umbrela-backend --err

# Testar se código inicia manualmente
cd ~/projeto-pay-Umbrela/backend
node src/server.js
# (Pare com Ctrl+C depois de ver o erro)
```

---

## 📝 Comandos Úteis

```bash
# Ver todos os processos PM2
pm2 list

# Ver informações detalhadas
pm2 describe projeto-pay-umbrela-backend

# Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend

# Reiniciar tudo
pm2 restart all

# Salvar configuração atual
pm2 save
```

---

**Execute os comandos de diagnóstico e me diga o que apareceu nos logs!**

