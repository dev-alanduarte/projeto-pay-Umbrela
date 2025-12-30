# 🔧 Corrigir Git na VPS

## Problema: Remote "umbrela" não encontrado

Execute estes comandos na VPS:

### 1. Verificar remotes atuais
```bash
cd ~/projeto-pay-Umbrela
git remote -v
```

### 2. Se não aparecer nada ou aparecer "origin", adicione o remote:
```bash
# Remover remote antigo (se existir)
git remote remove origin 2>/dev/null
git remote remove umbrela 2>/dev/null

# Adicionar remote correto
git remote add umbrela https://github.com/dev-alanduarte/projeto-pay-Umbrela.git

# Verificar se foi adicionado
git remote -v
```

### 3. Agora puxar as mudanças:
```bash
git pull umbrela main
```

---

## Se der erro de autenticação

### Opção 1: Usar Personal Access Token
```bash
# Quando pedir senha, use um Personal Access Token do GitHub
# Criar token em: https://github.com/settings/tokens
# Permissões: repo (todas)
```

### Opção 2: Configurar SSH (recomendado)
```bash
# Na sua máquina local, gere chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública para GitHub
# Settings > SSH and GPG keys > New SSH key

# Na VPS, alterar remote para SSH
git remote set-url umbrela git@github.com:dev-alanduarte/projeto-pay-Umbrela.git
```

---

## Comandos Completos (Copie e Cole)

```bash
# 1. Ir para o projeto
cd ~/projeto-pay-Umbrela

# 2. Verificar remotes
git remote -v

# 3. Adicionar/Corrigir remote
git remote remove umbrela 2>/dev/null
git remote add umbrela https://github.com/dev-alanduarte/projeto-pay-Umbrela.git

# 4. Verificar novamente
git remote -v

# 5. Puxar mudanças
git pull umbrela main

# 6. Verificar arquivos
ls -la backend/src/

# 7. Instalar dependências
cd backend
npm install --production
cd ..

# 8. Reiniciar PM2
pm2 restart ecosystem.config.js

# 9. Verificar logs
pm2 logs --lines 20
```

