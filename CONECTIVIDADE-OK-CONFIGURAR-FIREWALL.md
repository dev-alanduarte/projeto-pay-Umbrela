# ✅ Conectividade OK - Configurar Firewall Corretamente

## 🎉 Status: Conectividade Funcionando!

O teste mostrou:
- ✅ DNS OK
- ✅ HTTPS geral funciona
- ✅ **Requisição real completou em 1703ms com status 200**

## 🧪 Próximo Passo: Testar Endpoint do Backend

```bash
# Se o backend estiver rodando (npm run dev), teste:
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Deve retornar:**
```json
{
  "success": true,
  "transactionId": "...",
  "pixCode": "...",
  ...
}
```

## 🔥 Configurar Firewall Corretamente

Agora que sabemos que funciona, vamos reativar o firewall com regras corretas:

### Opção 1: UFW (Recomendado - Mais Simples)

```bash
# Ativar UFW
sudo ufw enable

# Permitir SSH (IMPORTANTE - não perca acesso!)
sudo ufw allow 22/tcp

# Permitir saída HTTPS (porta 443) - JÁ PERMITIDO POR PADRÃO
# Mas vamos garantir:
sudo ufw allow out 443/tcp

# Permitir saída HTTP (porta 80) - JÁ PERMITIDO POR PADRÃO
sudo ufw allow out 80/tcp

# Permitir entrada na porta do backend (se necessário)
sudo ufw allow 3001/tcp

# Permitir entrada na porta do frontend (se necessário)
sudo ufw allow 3000/tcp

# Verificar regras
sudo ufw status verbose
```

### Opção 2: iptables (Mais Controle)

```bash
# Limpar tudo primeiro
sudo iptables -F
sudo iptables -X

# Permitir loopback
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Permitir conexões estabelecidas
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Permitir SSH (IMPORTANTE!)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Permitir saída HTTPS (porta 443) - CRÍTICO PARA API
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Permitir saída HTTP (porta 80)
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT

# Permitir saída DNS (porta 53)
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Permitir entrada na porta do backend (se necessário)
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT

# Permitir entrada na porta do frontend (se necessário)
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT

# Negar tudo mais na entrada
sudo iptables -A INPUT -j DROP

# Permitir tudo na saída (padrão)
sudo iptables -P OUTPUT ACCEPT
sudo iptables -P FORWARD DROP

# Salvar regras (Ubuntu/Debian)
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save

# Verificar regras
sudo iptables -L -n -v
```

## ✅ Testar Após Configurar Firewall

```bash
# 1. Testar conectividade novamente
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network

# 2. Testar endpoint
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Se ambos funcionarem:**
- ✅ Firewall configurado corretamente!
- ✅ Segurança mantida
- ✅ Conectividade funcionando

## 🚀 Próximo: Testar com PM2

Depois que o firewall estiver configurado e funcionando:

```bash
cd ~/projeto-pay-Umbrela
pm2 kill
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs projeto-pay-umbrela-backend --lines 20
```

Teste novamente via PM2 e veja se funciona!

