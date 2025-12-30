# 🧪 Testar Frontend com cURL

## ✅ Testes Básicos

### 1. Testar se Frontend está Respondendo

```bash
# Teste básico - deve retornar HTML
curl -I http://localhost:3000/produto

# Teste com IP público (se acessível externamente)
curl -I http://24.152.36.55:3000/produto
```

**Resultado esperado:** `HTTP/1.1 200 OK`

---

### 2. Testar Rota com Parâmetro payment

```bash
# Teste local
curl http://localhost:3000/produto?payment=10.00

# Teste com IP público
curl http://24.152.36.55:3000/produto?payment=10.00
```

**Resultado esperado:** HTML da página com conteúdo do checkout

---

### 3. Verificar se HTML Contém Elementos Esperados

```bash
# Verificar se contém "PIX" ou "QR Code"
curl -s http://localhost:3000/produto?payment=10.00 | grep -i "pix\|qr"

# Verificar se contém script que faz requisição ao backend
curl -s http://localhost:3000/produto?payment=10.00 | grep -i "backend\|3001"
```

---

### 4. Testar Arquivos Estáticos

```bash
# Testar se arquivos CSS/JS são servidos
curl -I http://localhost:3000/page.html
curl -I http://localhost:3000/logomercadolivre.png
```

---

## 🔍 Teste Completo (Script)

Execute na VPS:

```bash
echo "=== TESTE FRONTEND ==="
echo ""
echo "1. Testando se frontend responde..."
curl -I http://localhost:3000/produto 2>&1 | head -1
echo ""
echo "2. Testando rota com payment..."
curl -s http://localhost:3000/produto?payment=10.00 | head -20
echo ""
echo "3. Verificando se contém 'PIX'..."
curl -s http://localhost:3000/produto?payment=10.00 | grep -i "pix" | head -3
echo ""
echo "4. Verificando se detecta backend..."
curl -s http://localhost:3000/produto?payment=10.00 | grep -i "3001\|backend" | head -3
echo ""
echo "=== FIM DO TESTE ==="
```

---

## ✅ Checklist

- [ ] Frontend responde com `200 OK`
- [ ] HTML é retornado corretamente
- [ ] Rota `/produto?payment=10.00` funciona
- [ ] HTML contém elementos relacionados a PIX/QR Code
- [ ] HTML contém referências ao backend (porta 3001)

---

**Execute os testes e me diga o resultado!**

