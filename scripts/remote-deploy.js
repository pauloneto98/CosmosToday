const fs = require("fs");
const path = require("path");
const { Client } = require("ssh2");

const keyPath = path.join(__dirname, "..", "cosmosdaily-key.pem");
const privateKey = fs.readFileSync(keyPath);

// Carregar conteúdo do .env.local dinamicamente para não commitar segredos no GitHub
const envPath = path.join(__dirname, "..", ".env.local");
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
} else {
  console.error("❌ Arquivo .env.local não encontrado na raiz do projeto!");
  process.exit(1);
}


// Sequência de comandos a executar na VPS
const commands = [
  // 1. Limpar arquivos antigos para liberar espaço em disco
  "echo '🧹 Limpando arquivos antigos para liberar espaco em disco...' && rm -f /home/ubuntu/cosmos-deploy.tar.gz && rm -f /home/ubuntu/cosmos-daily.tar.gz && rm -rf /home/ubuntu/.npm/_logs/* || true",

  // 2. Garantir que o swap está ativo (necessário para npm install em VPS de 1GB)
  "sudo swapon /swapfile 2>/dev/null || true",
  
  // 2. Extrair o novo pacote de deploy
  "echo '📦 Extraindo novo pacote de deploy...' && tar -xzf /home/ubuntu/cosmos-deploy-new.tar.gz -C /home/ubuntu/cosmos-daily/",
  
  // 3. Rodar npm install para sincronizar dependências
  "echo '⚙️ Instalando dependências (npm install)...' && cd /home/ubuntu/cosmos-daily && npm install",

  // 4. Gravar o .env.local na pasta do projeto
  `printf '${envContent.replace(/'/g, "'\\''").replace(/\n/g, "\\n")}' > /home/ubuntu/cosmos-daily/.env.local`,

  // 5. Verificar se foi criado corretamente
  "echo '--- Conteúdo do .env.local:' && grep -c '=' /home/ubuntu/cosmos-daily/.env.local && echo 'linhas gravadas com sucesso'",

  // 6. Reiniciar o PM2 completamente
  "pm2 delete cosmos-daily 2>/dev/null || true",
  "cd /home/ubuntu/cosmos-daily && pm2 start npm --name cosmos-daily -- start",
  "sleep 8",
  "pm2 save",

  // 7. Mostrar status e últimas linhas do log
  "pm2 status",
  "pm2 logs cosmos-daily --lines 15 --nostream",
];

function runCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n⚡ Executando: ${cmd.substring(0, 80)}${cmd.length > 80 ? '...' : ''}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = "";
      stream.on("data", (data) => {
        const text = data.toString();
        process.stdout.write(text);
        output += text;
      });
      stream.stderr.on("data", (data) => {
        const text = data.toString();
        if (!text.includes("No PM2")) process.stderr.write(text);
      });
      stream.on("close", () => resolve(output));
    });
  });
}

async function deploy() {
  const conn = new Client();

  conn.on("ready", async () => {
    console.log("🔗 Conectado à VPS CosmosDaily via SSH!\n");
    try {
      for (const cmd of commands) {
        await runCommand(conn, cmd);
      }
      console.log("\n========================================");
      console.log("🎉 DEPLOY REMOTO CONCLUÍDO COM SUCESSO!");
      console.log("========================================");
      console.log("🌌 Acesse: http://34.205.75.41");
      console.log("========================================\n");
    } catch (err) {
      console.error("❌ Erro durante o deploy:", err.message);
    } finally {
      conn.end();
    }
  });

  conn.on("error", (err) => {
    console.error("❌ Falha na conexão SSH:", err.message);
    process.exit(1);
  });

  conn.connect({
    host: "34.205.75.41",
    port: 22,
    username: "ubuntu",
    privateKey,
    readyTimeout: 20000,
  });
}

console.log("🚀 Iniciando deploy remoto automático na VPS CosmosDaily...");
deploy();
