# 🔧 Resolver Conflito do Git na VPS

## Problema Atual

O Git está impedindo o `git pull` porque há mudanças locais na VPS que conflitam com as mudanças remotas.

## Solução Rápida

Execute estes comandos na VPS:

```bash
# 1. Salvar mudanças locais em stash
git stash push -m "Mudanças locais antes do pull - $(date)"

# 2. Fazer pull das mudanças do GitHub
git pull origin main

# 3. Se houver arquivos não rastreados que precisam ser removidos
# (ecosystem.config.js e nginx-https.conf já existem no repositório)
# Se você quiser manter suas versões locais, faça backup primeiro:
cp ecosystem.config.js ecosystem.config.js.backup
cp nginx-https.conf nginx-https.conf.backup

# Depois remova ou mova os arquivos não rastreados
# (o Git vai sobrescrever com as versões do repositório)
git pull origin main

# 4. Reiniciar o backend
pm2 restart projeto-pay-umbrela-backend

# 5. Verificar logs
pm2 logs projeto-pay-umbrela-backend --lines 30
```

## Se Precisar Recuperar as Mudanças Locais Depois

```bash
# Ver o que está no stash
git stash list

# Aplicar as mudanças do stash (se necessário)
git stash pop

# Ou ver as diferenças antes de aplicar
git stash show -p
```

## Alternativa: Descartar Mudanças Locais

⚠️ **CUIDADO**: Isso vai descartar todas as mudanças locais!

```bash
# Descartar todas as mudanças locais
git reset --hard HEAD

# Remover arquivos não rastreados que conflitam
rm -f ecosystem.config.js nginx-https.conf

# Fazer pull
git pull origin main
```

## Depois do Pull

1. Verificar se o backend está rodando:
   ```bash
   pm2 status
   ```

2. Verificar logs para erros:
   ```bash
   pm2 logs projeto-pay-umbrela-backend --lines 50
   ```

3. Testar a URL:
   ```bash
   curl https://pagamentoseguromarketplace.com/produto?payment=29.99
   ```

4. Se necessário, aplicar configuração do Nginx:
   ```bash
   sudo cp nginx-https.conf /etc/nginx/sites-available/pagamentoseguromarketplace.com
   sudo nginx -t
   sudo systemctl reload nginx
   ```

