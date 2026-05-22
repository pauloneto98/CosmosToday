const fs = require("fs");
const path = require("path");
const { EC2Client, StopInstancesCommand, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

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

async function stop() {
  const instanceId = "i-03b0b18392145e71f";
  console.log(`🛑 Parando instância ${instanceId} remotamente via AWS...`);
  
  try {
    const response = await ec2.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
    console.log("✅ Comando de parada enviado com sucesso!");
    console.log("Aguardando alteração de estado...");
    
    // Wait for the instance to transition or check status
    let state = "stopping";
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const data = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      const inst = data.Reservations[0].Instances[0];
      state = inst.State.Name;
      console.log(`⚡ Status Atual: ${state}`);
      if (state === "stopped") {
        break;
      }
    }
    
    if (state === "stopped") {
      console.log("\n✅ A VPS foi desligada com sucesso!");
    } else {
      console.log("\n⏳ A VPS está em processo de desligamento.");
    }
  } catch (err) {
    console.error("❌ Erro:", err.message);
  }
}

stop();
