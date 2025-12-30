const path = require('path');

module.exports = {
  apps: [
    {
      name: 'projeto-pay-umbrela-backend',
      script: path.resolve(__dirname, 'backend', 'src', 'server.js'),
      cwd: path.resolve(__dirname, 'backend'),
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      // IMPORTANTE: merge_env: true garante que variáveis do .env sejam carregadas
      merge_env: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Configurações de log
      error_file: './logs/pm2-backend-error.log',
      out_file: './logs/pm2-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // IMPORTANTE: O dotenv/config no server.js vai carregar o .env
      // O cwd: './backend' garante que o .env será encontrado no diretório correto
      
      // Variáveis de ambiente (podem ser sobrescritas pelo .env)
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'projeto-pay-umbrela-frontend',
      script: 'server.js',
      cwd: './frontend',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configurações de log
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
