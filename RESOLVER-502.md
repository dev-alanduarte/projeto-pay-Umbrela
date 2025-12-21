# 🔧 Resolver Erro 502 Bad Gateway

## O que significa o erro 502?

O erro 502 Bad Gateway indica que o Nginx está tentando fazer proxy para o backend (porta 3001), mas não consegue se conectar ou o backend não está respondendo.

## Diagnóstico Rápido

Execute estes comandos na VPS para identificar o problema:

### 1. Verificar se o backend está rodando

```bash
pm2 status
```

**Esperado:** Deve mostrar `projeto-pay-umbrela-backend` com status `online`

**Se estiver offline ou erro:**
```bash
pm2 logs projeto-pay-umbrela-backend --lines 50
```

### 2. Verificar se o backend está escutando na porta 3001

```bash
netstat -tlnp | grep 3001
# ou
ss -tlnp | grep 3001
```

**Esperado:** Deve mostrar algo como:
```
tcp  0  0 127.0.0.1:3001  0.0.0.0:*  LISTEN  <pid>/node
```

**Se não aparecer nada:** O backend não está escutando na porta 3001

### 3. Testar conexão direta com o backend

```bash
curl http://localhost:3001/health
```

**Esperado:** Deve retornar `{"ok":true,"uptime":...}`

**Se der erro:** O backend não está respondendo

### 4. Verificar logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
```

**Procure por erros como:**
- `connect() failed (111: Connection refused)`
- `upstream timed out`
- `no live upstreams`

## Soluções

### Solução 1: Reiniciar o Backend

```bash
# Parar o backend
pm2 stop projeto-pay-umbrela-backend

# Verificar se parou
pm2 status

# Iniciar novamente
pm2 start projeto-pay-umbrela-backend

# Ou reiniciar tudo
pm2 restart all

# Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend --lines 50
```

### Solução 2: Verificar se o backend está configurado corretamente

```bash
# Ver o arquivo ecosystem.config.js
cat ecosystem.config.js

# Verificar se está apontando para o arquivo correto
cd ~/projeto-pay-Umbrela
ls -la backend/src/server.js
```

### Solução 3: Verificar se há erros no código

```bash
# Tentar rodar o backend manualmente para ver erros
cd ~/projeto-pay-Umbrela/backend
node src/server.js
```

**Se der erro:** O código tem algum problema que precisa ser corrigido

### Solução 4: Verificar configuração do Nginx

```bash
# Ver a configuração atual
sudo cat /etc/nginx/sites-available/pagamentoseguromarketplace.com | grep -A 10 "location.*pix"

# Verificar se está apontando para localhost:3001
sudo grep -n "proxy_pass.*3001" /etc/nginx/sites-available/pagamentoseguromarketplace.com
```

**Deve mostrar:**
```nginx
proxy_pass http://localhost:3001/pix;
```

### Solução 5: Verificar se o PM2 está configurado corretamente

```bash
# Ver processos PM2
pm2 list

# Ver detalhes do processo
pm2 describe projeto-pay-umbrela-backend

# Ver se está usando o ecosystem.config.js correto
pm2 show projeto-pay-umbrela-backend
```

### Solução 6: Recarregar Nginx

```bash
# Testar configuração
sudo nginx -t

# Se estiver OK, recarregar
sudo systemctl reload nginx

# Ou reiniciar
sudo systemctl restart nginx
```

## Checklist Completo

Execute na ordem:

```bash
# 1. Verificar status do PM2
pm2 status

# 2. Se não estiver rodando, iniciar
pm2 start ecosystem.config.js
# ou
pm2 restart all

# 3. Verificar se está escutando na porta
netstat -tlnp | grep 3001

# 4. Testar conexão direta
curl http://localhost:3001/health

# 5. Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 30

# 6. Ver logs do Nginx
sudo tail -20 /var/log/nginx/error.log

# 7. Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# 8. Testar a URL novamente
curl -I https://pagamentoseguromarketplace.com/produto?payment=29.99
```

## Problemas Comuns

### Backend crashou

```bash
# Ver último erro
pm2 logs projeto-pay-umbrela-backend --err --lines 50

# Reiniciar
pm2 restart projeto-pay-umbrela-backend
```

### Porta 3001 já está em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3001
# ou
sudo netstat -tlnp | grep 3001

# Matar o processo se necessário
sudo kill -9 <PID>
```

### Backend não iniciou após atualização

```bash
# Verificar se há erros de sintaxe
cd ~/projeto-pay-Umbrela/backend
node -c src/server.js

# Tentar rodar manualmente
node src/server.js
```

### Nginx não consegue conectar

```bash
# Verificar se o backend está escutando em localhost (127.0.0.1)
netstat -tlnp | grep 3001

# Se estiver escutando em 0.0.0.0:3001, está OK
# Se não estiver escutando, o backend não iniciou corretamente
```

## Depois de Resolver

1. Teste a URL: `https://pagamentoseguromarketplace.com/produto?payment=29.99`
2. Verifique o console do navegador (F12) para ver se há outros erros
3. Verifique os logs do backend: `pm2 logs projeto-pay-umbrela-backend`

