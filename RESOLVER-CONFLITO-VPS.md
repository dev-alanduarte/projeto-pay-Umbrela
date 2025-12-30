# 🔧 Resolver Conflito de Git na VPS

## Problema: Mudanças locais que serão sobrescritas

Execute estes comandos na VPS:

### Opção 1: Salvar mudanças locais e depois aplicar (se necessário)

```bash
# 1. Salvar mudanças locais
git stash

# 2. Puxar mudanças do GitHub
git pull origin main

# 3. Ver mudanças locais salvas (se quiser aplicar depois)
git stash list

# 4. Se quiser aplicar mudanças locais de volta
git stash pop
```

### Opção 2: Descartar mudanças locais (se não forem importantes)

```bash
# 1. Descartar mudanças locais
git checkout -- corrigir-server-vps.sh

# 2. Puxar mudanças do GitHub
git pull origin main
```

### Opção 3: Ver o que mudou antes de decidir

```bash
# 1. Ver diferenças
git diff corrigir-server-vps.sh

# 2. Depois escolha uma das opções acima
```

---

## Comandos Rápidos (Recomendado)

```bash
# Salvar mudanças locais e puxar
git stash
git pull origin main

# Verificar se atualizou
ls backend/src/

# Instalar dependências
cd backend
npm install --production
cd ..

# Reiniciar PM2
pm2 restart ecosystem.config.js
```

---

## Se o arquivo corrigir-server-vps.sh não for importante

```bash
# Descartar mudanças e puxar
git checkout -- corrigir-server-vps.sh
git pull origin main
```
