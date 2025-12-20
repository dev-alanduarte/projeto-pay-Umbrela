# 🧪 Guia de Teste Local

## Configuração Atual:
- **Backend**: Porta 4001
- **Frontend**: Porta 3000

## Passo a Passo para Testar Localmente:

### 1. Instalar dependências:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 2. Configurar arquivo .env do backend:

```bash
cd backend
# Criar/editar .env
```

Adicione:
```env
PORT=4001
UMBRELLAPAG_API_KEY=sua_chave_aqui
UMBRELLAPAG_HOSTNAME=app.umbrellapag.com
```

### 3. Iniciar Backend (Terminal 1):

```bash
cd backend
npm start
```

Você deve ver: `Backend running on http://localhost:4001`

### 4. Iniciar Frontend (Terminal 2):

```bash
cd frontend
npm start
```

Você deve ver algo como: `Starting up http-server, serving ./`

### 5. Testar:

#### Backend:
```bash
curl http://localhost:4001/health
```

Deve retornar: `{"ok":true,"uptime":...}`

#### Frontend no navegador:
```
http://localhost:3000/cliente/produto/payment/20.99
```

ou

```
http://localhost:3000/page.html?payment=20.99
```

### 6. Verificar se está funcionando:

- ✅ Backend responde em `http://localhost:4001/health`
- ✅ Frontend abre em `http://localhost:3000`
- ✅ Frontend consegue fazer requisições para o backend
- ✅ QR Code é gerado corretamente

### 7. Se houver erros:

#### Erro de CORS:
- Verifique se o backend está permitindo `http://localhost:3000` no CORS

#### Erro de conexão:
- Verifique se o backend está rodando na porta 4001
- Verifique o console do navegador (F12) para ver erros

#### QR Code não aparece:
- Verifique se o `qrcode.min.js` está carregando (aba Network do DevTools)
- Verifique se a API do backend está retornando dados corretos

## Comandos Úteis:

```bash
# Ver processos rodando nas portas
netstat -ano | findstr :3000
netstat -ano | findstr :4001

# Parar processos (Windows)
# Encontre o PID e use:
taskkill /PID <pid> /F
```

