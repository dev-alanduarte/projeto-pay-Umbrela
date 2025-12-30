# 🚀 Setup Inicial na VPS

## ⚠️ IMPORTANTE: Node.js v12 é muito antigo

Se você tiver Node.js v12, precisa atualizar ou usar versões compatíveis.

## Passo 1: Limpar PM2 Antigo

```bash
# Parar todos os processos
pm2 stop all

# Deletar todos os processos
pm2 delete all

# Limpar dump
pm2 kill
```

## Passo 2: Instalar Dependências

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install --production
cd ..
```

## Passo 3: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env no backend
cd backend
nano .env
```

Adicione:
```
UMBRELLAPAG_API_KEY=sua_chave_aqui
POSTBACK_URL=https://webhook.site/unique-id
PORT=3001
NODE_ENV=production
```

Salve e saia (Ctrl+X, Y, Enter)

## Passo 4: Criar Diretório de Logs

```bash
cd ~/projeto-pay-Umbrela
mkdir -p logs
```

## Passo 5: Iniciar com PM2 (NOVO)

```bash
# Limpar PM2 primeiro
pm2 kill

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 status

# Ver logs
pm2 logs
```

## Passo 6: Testar

```bash
# Testar backend
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

## 🔧 Se Node.js v12 der problema:

### Opção 1: Atualizar Node.js (Recomendado)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verificar versão
node --version
```

### Opção 2: Usar versões antigas compatíveis

Se não puder atualizar Node.js, precisamos ajustar as dependências.

## Comandos Úteis

```bash
# Ver logs
pm2 logs projeto-pay-umbrela-backend
pm2 logs projeto-pay-umbrela-frontend

# Reiniciar
pm2 restart all

# Parar
pm2 stop all

# Ver status
pm2 status
```
