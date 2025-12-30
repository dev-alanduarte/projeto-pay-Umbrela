# 🔍 Diagnosticar Servidor na VPS

## Problema: Connection refused na porta 3001

### 1. Verificar status do PM2
```bash
pm2 status
```

### 2. Ver logs de erro
```bash
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

### 3. Ver todos os logs
```bash
pm2 logs projeto-pay-umbrela-backend --lines 50
```

### 4. Verificar se a porta está em uso
```bash
netstat -tulpn | grep :3001
# ou
lsof -i :3001
```

### 5. Tentar iniciar manualmente para ver erro
```bash
cd backend
node src/server.js
```

---

## Solução Passo a Passo

### Passo 1: Atualizar código e dependências
```bash
# Puxar última versão
git pull origin main

# Instalar dependências
cd backend
npm install --production
cd ..
```

### Passo 2: Parar e reiniciar PM2
```bash
# Parar todos
pm2 stop all

# Deletar processos
pm2 delete all

# Iniciar novamente
pm2 start ecosystem.config.js

# Salvar
pm2 save

# Verificar
pm2 status
```

### Passo 3: Verificar logs
```bash
pm2 logs projeto-pay-umbrela-backend --lines 30
```

### Passo 4: Testar
```bash
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## Erros Comuns

### Erro: "Cannot find module 'node-fetch'"
```bash
cd backend
npm install --production
cd ..
pm2 restart projeto-pay-umbrela-backend
```

### Erro: "SyntaxError" ou "Unexpected token"
- Verificar versão do Node.js: `node --version`
- Deve ser Node.js 14+ (mas a correção já resolve para versões antigas)

### Erro: "Missing UMBRELLAPAG_API_KEY"
```bash
# Verificar se .env existe
cat backend/.env | grep UMBRELLAPAG_API_KEY

# Se não existir, criar
cd backend
nano .env
# Adicionar: UMBRELLAPAG_API_KEY=sua_chave_aqui
```

---

## Verificar Processo Manualmente

Se o PM2 não funcionar, teste direto:

```bash
cd backend
node src/server.js
```

Deve mostrar: `Backend running on http://localhost:3001`

Se funcionar, o problema é no PM2. Se não funcionar, há erro no código.

