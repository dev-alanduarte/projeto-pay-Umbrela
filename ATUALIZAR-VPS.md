# 🚀 Como Atualizar o Código na VPS

## 📋 Método 1: Via SSH (Recomendado)

### 1. Conectar na VPS
```bash
ssh usuario@seu-servidor.com
# ou
ssh usuario@IP_DO_SERVIDOR
```

### 2. Navegar até a pasta do projeto
```bash
cd /caminho/do/projeto
# Exemplo comum:
cd ~/checkout-agilize
# ou
cd /var/www/checkout-agilize
```

### 3. Verificar status atual
```bash
git status
```

### 4. Puxar as mudanças do GitHub
```bash
git pull umbrela main
# ou se o remote se chama origin:
git pull origin main
```

### 5. Instalar dependências (se houver novas)
```bash
cd backend
npm install
cd ..
```

### 6. Reiniciar o servidor
```bash
# Se usar PM2:
pm2 restart all
# ou
pm2 restart server

# Se usar systemd:
sudo systemctl restart seu-servico

# Se usar node diretamente:
# Pare o processo atual (Ctrl+C) e inicie novamente:
cd backend
npm start
```

---

## 📋 Método 2: Script Automatizado

Crie um arquivo `atualizar.sh` na VPS:

```bash
#!/bin/bash
echo "🔄 Atualizando código da VPS..."

# Navega para o diretório do projeto
cd /caminho/do/projeto

# Puxa as mudanças
echo "📥 Puxando mudanças do GitHub..."
git pull umbrela main

# Instala dependências se necessário
echo "📦 Instalando dependências..."
cd backend
npm install --production
cd ..

# Reinicia o servidor
echo "🔄 Reiniciando servidor..."
pm2 restart all

echo "✅ Atualização concluída!"
```

**Tornar executável:**
```bash
chmod +x atualizar.sh
```

**Executar:**
```bash
./atualizar.sh
```

---

## 📋 Método 3: Via GitHub Actions (CI/CD)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /caminho/do/projeto
            git pull umbrela main
            cd backend
            npm install --production
            pm2 restart all
```

---

## 🔧 Comandos Úteis na VPS

### Ver logs do servidor
```bash
# PM2
pm2 logs

# Systemd
sudo journalctl -u seu-servico -f

# Node direto
# Os logs aparecem no terminal
```

### Verificar se o servidor está rodando
```bash
# PM2
pm2 status

# Systemd
sudo systemctl status seu-servico

# Porta
netstat -tulpn | grep :3001
```

### Verificar variáveis de ambiente
```bash
cd backend
cat .env
```

### Verificar última atualização
```bash
git log -1
```

---

## ⚠️ Checklist Antes de Atualizar

- [ ] Backup do banco de dados (se houver)
- [ ] Backup do arquivo `.env`
- [ ] Verificar se há mudanças locais na VPS que serão sobrescritas
- [ ] Verificar se o servidor está funcionando antes de atualizar

---

## 🐛 Troubleshooting

### Erro: "Your local changes would be overwritten"
```bash
# Salvar mudanças locais
git stash

# Puxar mudanças
git pull umbrela main

# Aplicar mudanças locais de volta (se necessário)
git stash pop
```

### Erro: "Permission denied"
```bash
# Verificar permissões
ls -la

# Dar permissão ao usuário
sudo chown -R usuario:usuario /caminho/do/projeto
```

### Servidor não inicia após atualização
```bash
# Ver logs de erro
pm2 logs --err

# Verificar se as dependências foram instaladas
cd backend
npm install

# Verificar variáveis de ambiente
cat .env
```

---

## 📝 Exemplo Completo de Atualização

```bash
# 1. Conectar na VPS
ssh usuario@seu-servidor.com

# 2. Ir para o projeto
cd ~/checkout-agilize

# 3. Verificar status
git status

# 4. Puxar mudanças
git pull umbrela main

# 5. Instalar dependências (se necessário)
cd backend
npm install --production
cd ..

# 6. Reiniciar
pm2 restart all

# 7. Verificar se está funcionando
pm2 logs --lines 50
```

---

## 🔐 Segurança

**NUNCA faça commit de:**
- Arquivos `.env` com senhas/tokens
- Chaves SSH privadas
- Credenciais de banco de dados

**Sempre:**
- Use variáveis de ambiente na VPS
- Mantenha o `.env` fora do Git
- Use secrets no GitHub Actions

