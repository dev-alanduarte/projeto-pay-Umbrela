#!/bin/bash

echo "🔍 Testando conectividade de rede..."
echo ""

echo "1️⃣ Testando outros sites HTTPS..."
curl -I https://www.google.com --max-time 5
echo ""

echo "2️⃣ Testando GitHub..."
curl -I https://github.com --max-time 5
echo ""

echo "3️⃣ Testando API UmbrellaPag (IP direto)..."
curl -I https://52.201.206.133 --max-time 5 -H "Host: api-gateway.umbrellapag.com"
echo ""

echo "4️⃣ Verificando rota até API..."
traceroute -m 10 api-gateway.umbrellapag.com 2>/dev/null || echo "traceroute não disponível"
echo ""

echo "5️⃣ Testando telnet na porta 443..."
timeout 5 bash -c "</dev/tcp/api-gateway.umbrellapag.com/443" && echo "✅ Porta 443 acessível" || echo "❌ Porta 443 bloqueada"
echo ""

echo "6️⃣ Verificando IP da VPS..."
curl -s ifconfig.me
echo ""

