const fs = require("fs");
const path = require("path");
const { Client } = require("ssh2");

const keyPath = path.join(__dirname, "..", "cosmosdaily-key.pem");
const privateKey = fs.readFileSync(keyPath);
const localFile = path.join(__dirname, "..", "cosmos-deploy-new.tar.gz");
const remoteFile = "/home/ubuntu/cosmos-deploy-new.tar.gz";
const host = "34.205.75.41"; // A VPS que está rodando!

const conn = new Client();

console.log(`📤 Iniciando upload de ${localFile} para a VPS (${host})...`);

conn.on("ready", () => {
  console.log("🔗 Conexão SSH estabelecida. Iniciando canal SFTP...");
  conn.sftp((err, sftp) => {
    if (err) {
      console.error("❌ Erro ao abrir canal SFTP:", err.message);
      conn.end();
      process.exit(1);
    }

    const stats = fs.statSync(localFile);
    const totalBytes = stats.size;
    let bytesTransferred = 0;

    console.log(`📦 Tamanho do arquivo: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);

    const readStream = fs.createReadStream(localFile);
    const writeStream = sftp.createWriteStream(remoteFile);

    readStream.on("data", (chunk) => {
      bytesTransferred += chunk.length;
      const progress = ((bytesTransferred / totalBytes) * 100).toFixed(1);
      process.stdout.write(`\r🚀 Progresso do Upload: ${progress}% (${(bytesTransferred / (1024 * 1024)).toFixed(2)} MB / ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
    });

    writeStream.on("close", () => {
      console.log("\n✅ Upload concluído com sucesso!");
      conn.end();
    });

    writeStream.on("error", (err) => {
      console.error("\n❌ Erro durante o upload:", err.message);
      conn.end();
    });

    readStream.pipe(writeStream);
  });
});

conn.on("error", (err) => {
  console.error("❌ Falha na conexão SSH:", err.message);
});

conn.connect({
  host,
  port: 22,
  username: "ubuntu",
  privateKey,
  readyTimeout: 20000,
});
