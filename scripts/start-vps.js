const fs = require("fs");
const path = require("path");
const { EC2Client, StartInstancesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

const envPath = path.join(__dirname, "..", ".env.local");
let awsSecretAccessKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const secretMatch = envContent.match(/AWS_CLOUD_FREE_TIER_KEY\s*=\s*(.+)/);
  if (secretMatch && secretMatch[1]) awsSecretAccessKey = secretMatch[1].trim();
}

const ec2 = new EC2Client({
  region: "us-east-1",
  credentials: { accessKeyId: "AKIAXQ5ESUISMQLCHXW4", secretAccessKey: awsSecretAccessKey }
});

async function start() {
  const instanceId = "i-03b0b18392145e71f";
  console.log(`🚀 Iniciando instância ${instanceId} remotamente via AWS...`);
  
  try {
    const response = await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));
    console.log("✅ Comando de inicialização enviado com sucesso!");
    console.log("Aguardando alteração de estado...");
    
    let state = "pending";
    let ip = "";
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const data = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      const inst = data.Reservations[0].Instances[0];
      state = inst.State.Name;
      ip = inst.PublicIpAddress;
      console.log(`⚡ Status Atual: ${state} | IP Público: ${ip || "Aguardando..."}`);
      if (state === "running") {
        break;
      }
    }
    
    if (state === "running") {
      console.log(`\n========================================================`);
      console.log(`🎉 A VPS ESTÁ NO AR E PRONTA!`);
      console.log(`📍 IP Público Atual: ${ip}`);
      console.log(`========================================================`);
      console.log(`💻 Conexão SSH:`);
      console.log(`ssh -i "cosmosdaily-key.pem" ubuntu@${ip}`);
      console.log(`========================================================\n`);
    } else {
      console.log(`\n⏳ A VPS está em processo de inicialização. Status: ${state}`);
    }
  } catch (err) {
    console.error("❌ Erro:", err.message);
  }
}

start();
