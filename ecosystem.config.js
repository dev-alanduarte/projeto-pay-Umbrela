module.exports = {
  apps: [{
    name: 'projeto-pay-umbrela',
    script: 'npm',
    args: 'start',
    cwd: './backend',
    interpreter: 'none',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // Configurações de log
    error_file: '../logs/pm2-error.log',
    out_file: '../logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Auto restart
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Variáveis de ambiente (podem ser sobrescritas pelo .env)
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
