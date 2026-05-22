const fs = require("fs");
const path = require("path");
const { EC2Client, RebootInstancesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

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

async function reboot() {
  const instanceId = "i-03b0b18392145e71f";
  console.log(`🔄 Reiniciando instância ${instanceId} remotamente via AWS...`);
  
  try {
    await ec2.send(new RebootInstancesCommand({ InstanceIds: [instanceId] }));
    console.log("✅ Comando de reboot enviado! Aguardando 30 segundos para o sistema ligar...");
    
    await new Promise(r => setTimeout(r, 30000));
    
    const data = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    const inst = data.Reservations[0].Instances[0];
    console.log(`⚡ Status: ${inst.State.Name}`);
    console.log(`📍 IP: ${inst.PublicIpAddress}`);
    console.log("\n✅ VPS reiniciada! Agora tente se conectar:");
    console.log(`ssh -i cosmosdaily-key.pem ubuntu@${inst.PublicIpAddress}`);
  } catch (err) {
    console.error("❌ Erro:", err.message);
  }
}

reboot();
