# 🧹 Limpar Processos PM2 Duplicados na VPS

## Problema: 3 processos rodando quando deveria ter apenas 2

### Verificar o que está rodando
```bash
pm2 list
# ou
pm2 status
```

### Ver detalhes de cada processo
```bash
pm2 describe 0
pm2 describe 1
pm2 describe 2
```

### Solução: Parar tudo e reiniciar corretamente

```bash
# 1. Parar todos os processos
pm2 stop all

# 2. Deletar todos os processos
pm2 delete all

# 3. Verificar se está limpo
pm2 list

# 4. Iniciar apenas os processos do ecosystem.config.js
pm2 start ecosystem.config.js

# 5. Salvar a configuração para iniciar automaticamente
pm2 save

# 6. Verificar status
pm2 status
```

---

## Verificar ecosystem.config.js

O arquivo deve ter apenas 2 apps:
- `projeto-pay-umbrela-backend` (porta 3001)
- `projeto-pay-umbrela-frontend` (porta 3000)

Se tiver mais, pode ser processo antigo ou duplicado.

---

## Comandos Rápidos

```bash
# Parar e limpar tudo
pm2 stop all
pm2 delete all

# Iniciar apenas os corretos
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar
pm2 status
```

---

## Ver Logs de Cada Processo

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 20

# Ver logs do frontend
pm2 logs projeto-pay-umbrela-frontend --lines 20

# Ver todos os logs
pm2 logs --lines 20
```

