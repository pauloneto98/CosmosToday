const fs = require("fs");
const path = require("path");
const { Client } = require("ssh2");

const keyPath = path.join(__dirname, "..", "cosmosdaily-key.pem");
const privateKey = fs.readFileSync(keyPath);

const commands = [
  "echo '=== HOME DIRECTORY ===' && ls -la /home/ubuntu",
  "echo '=== COSMOS-DAILY DIRECTORY ===' && ls -la /home/ubuntu/cosmos-daily || echo 'cosmos-daily folder not found'",
  "echo '=== PM2 STATUS ===' && pm2 status || echo 'pm2 not running'",
  "echo '=== NGINX STATUS ===' && systemctl status nginx --no-pager || echo 'nginx not running'",
];

function runCommand(conn, cmd) {
  return new Promise((resolve) => {
    console.log(`\n⚡ Executando: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error(`❌ Erro: ${err.message}`);
        return resolve();
      }
      stream.on("data", (data) => {
        process.stdout.write(data.toString());
      });
      stream.stderr.on("data", (data) => {
        process.stderr.write(data.toString());
      });
      stream.on("close", () => resolve());
    });
  });
}

async function diagnose() {
  const conn = new Client();
  const vpsIp = "34.205.75.41"; // A VPS que acabamos de ligar!

  conn.on("ready", async () => {
    console.log(`🔗 Conectado à VPS ${vpsIp} via SSH!\n`);
    try {
      for (const cmd of commands) {
        await runCommand(conn, cmd);
      }
    } catch (err) {
      console.error("❌ Erro no SSH:", err.message);
    } finally {
      conn.end();
    }
  });

  conn.on("error", (err) => {
    console.error("❌ Falha na conexão SSH:", err.message);
  });

  conn.connect({
    host: vpsIp,
    port: 22,
    username: "ubuntu",
    privateKey,
    readyTimeout: 20000,
  });
}

diagnose();
