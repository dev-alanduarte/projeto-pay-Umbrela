# ✅ Finalizar Atualização na VPS

## 📋 Próximos Passos

Execute estes comandos na VPS:

### 1. Verificar se os arquivos foram atualizados
```bash
ls backend/src/
# Deve mostrar: umbrella-deposit-edge-function.js
```

### 2. Instalar dependências (se necessário)
```bash
cd backend
npm install --production
cd ..
```

### 3. Verificar variável de ambiente
```bash
cat backend/.env | grep UMBRELLAPAG_API_KEY
# Deve mostrar a API key
```

### 4. Reiniciar o servidor PM2
```bash
pm2 restart ecosystem.config.js
```

### 5. Verificar status
```bash
pm2 status
```

### 6. Ver logs (últimas 30 linhas)
```bash
pm2 logs --lines 30
```

### 7. Testar se está funcionando
```bash
# Verificar se a rota /pix está respondendo
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## ✅ Checklist de Verificação

- [ ] Arquivo `umbrella-deposit-edge-function.js` existe em `backend/src/`
- [ ] Arquivo `umbrellapagClient.js` foi removido
- [ ] `server.js` foi atualizado
- [ ] `page.html` foi atualizado
- [ ] PM2 reiniciado com sucesso
- [ ] Logs não mostram erros
- [ ] API responde corretamente

---

## 🐛 Se Algo Der Errado

### Servidor não inicia
```bash
# Ver logs de erro
pm2 logs --err --lines 50

# Verificar se .env está correto
cat backend/.env

# Tentar iniciar manualmente para ver erro
cd backend
node src/server.js
```

### Erro de dependências
```bash
cd backend
rm -rf node_modules package-lock.json
npm install --production
cd ..
pm2 restart ecosystem.config.js
```

### Verificar se porta está em uso
```bash
netstat -tulpn | grep :3001
```

