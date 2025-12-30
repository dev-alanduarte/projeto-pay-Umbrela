# 🔥 Desativar Firewall na VPS para Teste

## ⚠️ ATENÇÃO: Desativar firewall deixa a VPS vulnerável!

**Faça isso apenas para teste e reative depois!**

## 🔍 Passo 1: Verificar Qual Firewall Está Ativo

```bash
# Verificar se UFW está ativo
sudo ufw status

# Verificar se iptables está ativo
sudo iptables -L -n -v

# Verificar se firewalld está ativo (CentOS/RHEL)
sudo systemctl status firewalld
```

## 🛑 Passo 2: Desativar Firewall (Escolha o seu)

### Opção A: UFW (Ubuntu/Debian mais comum)

```bash
# Desativar UFW
sudo ufw disable

# Verificar status
sudo ufw status
# Deve mostrar: Status: inactive
```

### Opção B: iptables (mais comum)

```bash
# Limpar todas as regras
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -F
sudo iptables -t nat -X
sudo iptables -t mangle -F
sudo iptables -t mangle -X

# Permitir tudo (POLICY ACCEPT)
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT

# Verificar
sudo iptables -L -n -v
```

### Opção C: firewalld (CentOS/RHEL)

```bash
# Parar e desabilitar firewalld
sudo systemctl stop firewalld
sudo systemctl disable firewalld

# Verificar
sudo systemctl status firewalld
```

## 🧪 Passo 3: Testar Conectividade

```bash
# Testar conectividade com API
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network

# Testar manualmente
curl -v https://api-gateway.umbrellapag.com --max-time 10

# Testar endpoint do backend
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

## ✅ Passo 4: Se Funcionar, Reativar Firewall com Regras Corretas

### UFW - Permitir apenas o necessário

```bash
# Permitir SSH (IMPORTANTE!)
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS de saída (já deve estar por padrão)
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp

# Permitir entrada na porta do backend (se necessário)
sudo ufw allow 3001/tcp

# Ativar UFW
sudo ufw enable
sudo ufw status
```

### iptables - Permitir apenas o necessário

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

# Permitir saída HTTPS (porta 443)
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Permitir saída HTTP (porta 80)
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT

# Permitir entrada na porta do backend (se necessário)
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT

# Permitir entrada na porta do frontend (se necessário)
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT

# Negar tudo mais na entrada
sudo iptables -A INPUT -j DROP

# Permitir tudo na saída (padrão)
sudo iptables -P OUTPUT ACCEPT

# Salvar regras (Ubuntu/Debian)
sudo apt-get install iptables-persistent
sudo netfilter-persistent save

# Ou manualmente (CentOS/RHEL)
sudo service iptables save
```

## 🔄 Passo 5: Reiniciar Backend e Testar

```bash
# Se estiver rodando npm run dev, pare com Ctrl+C
# Depois teste novamente:
cd ~/projeto-pay-Umbrela/backend
npm run dev
```

## 📋 Checklist

- [ ] Firewall desativado
- [ ] Teste de conectividade executado
- [ ] Endpoint testado
- [ ] Se funcionou, firewall reativado com regras corretas
- [ ] SSH ainda funciona (não ficou trancado fora!)

## ⚠️ IMPORTANTE

**NUNCA deixe o firewall desativado em produção!**

Se desativar o firewall resolver o problema, significa que o firewall estava bloqueando. Reative com as regras corretas acima.

