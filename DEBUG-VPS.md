# 🐛 Guia de Debug - PIX não está gerando na VPS

## Problemas Comuns e Soluções

### 1. Verificar se o backend está rodando

```bash
# Ver processos PM2
pm2 list

# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 50

# Verificar se a porta 3001 está aberta
sudo netstat -tlnp | grep 3001
```

### 2. Testar o backend diretamente

```bash
# Testar health check
curl http://localhost:3001/health

# Testar rota de PIX diretamente
curl -H "Accept: application/json" "http://localhost:3001/cliente/produto/payment/29.99"
```

### 3. Verificar configuração do Nginx

```bash
# Verificar se o nginx está rodando
sudo systemctl status nginx

# Ver logs de erro do nginx
sudo tail -f /var/log/nginx/error.log

# Testar configuração do nginx
sudo nginx -t

# Ver configuração atual
sudo cat /etc/nginx/sites-available/pagamentoseguromarketplace.com | grep -A 20 "location.*produto"
```

### 4. Verificar variáveis de ambiente

```bash
cd /var/www/projeto-pay-umbrela/backend
cat .env | grep UMBRELLAPAG
```

**Importante**: O arquivo `.env` deve ter:
```
UMBRELLAPAG_API_KEY=sua_chave_aqui
UMBRELLAPAG_HOSTNAME=app.umbrellapag.com
```

### 5. Verificar se o frontend está fazendo requisição correta

No navegador, abra o Console (F12) e verifique:
- Qual URL está sendo chamada
- Qual é o status da resposta
- Qual é o erro (se houver)

### 6. Testar requisição manualmente

```bash
# Simular requisição que o frontend faz
curl -X GET \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  "https://pagamentoseguromarketplace.com/cliente/produto/payment/29.99"
```

### 7. Verificar se o nginx está fazendo proxy corretamente

```bash
# Ver logs de acesso do nginx em tempo real
sudo tail -f /var/log/nginx/access.log | grep produto
```

## Checklist Rápido

- [ ] Backend está rodando (pm2 list)
- [ ] Backend responde em localhost:3001/health
- [ ] Arquivo .env existe e tem UMBRELLAPAG_HOSTNAME configurado
- [ ] Nginx está rodando (sudo systemctl status nginx)
- [ ] Configuração do nginx está correta (sudo nginx -t)
- [ ] Nginx foi recarregado após mudanças (sudo systemctl reload nginx)
- [ ] Frontend está fazendo requisição para URL correta (ver console do navegador)

## Comandos para Aplicar Correções

```bash
# 1. Ir para o diretório do projeto
cd /var/www/projeto-pay-umbrela

# 2. Fazer pull das mudanças
git pull origin main

# 3. Verificar se o .env existe e está correto
cd backend
cat .env

# 4. Reiniciar backend
pm2 restart projeto-pay-umbrela-backend

# 5. Ver logs para verificar erros
pm2 logs projeto-pay-umbrela-backend --lines 20

# 6. Aplicar configuração do nginx
sudo cp nginx-https.conf /etc/nginx/sites-available/pagamentoseguromarketplace.com

# 7. Testar configuração
sudo nginx -t

# 8. Se estiver OK, recarregar
sudo systemctl reload nginx

# 9. Verificar logs do nginx
sudo tail -f /var/log/nginx/error.log
```

