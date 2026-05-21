const fs = require("fs");
const path = require("path");
const { EC2Client, DescribeInstancesCommand } = require("@aws-sdk/client-ec2");

const envPath = path.join(__dirname, "..", ".env.local");
let awsAccessKeyId = "AKIAXQ5ESUISMQLCHXW4";
let awsSecretAccessKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const secretMatch = envContent.match(/AWS_CLOUD_FREE_TIER_KEY\s*=\s*(.+)/);
  if (secretMatch && secretMatch[1]) {
    awsSecretAccessKey = secretMatch[1].trim();
  }
}

if (!awsSecretAccessKey) {
  console.error("❌ Erro: Chave AWS_CLOUD_FREE_TIER_KEY não encontrada.");
  process.exit(1);
}

const ec2 = new EC2Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  }
});

async function checkStatus() {
  console.log("🔍 Consultando status das instâncias EC2 na AWS...");
  try {
    const data = await ec2.send(new DescribeInstancesCommand({}));
    const reservations = data.Reservations || [];
    
    if (reservations.length === 0) {
      console.log("ℹ️ Nenhuma instância encontrada na região us-east-1.");
      return;
    }

    reservations.forEach((res, resIdx) => {
      res.Instances.forEach((inst, instIdx) => {
        const nameTag = inst.Tags ? inst.Tags.find(t => t.Key === "Name") : null;
        const name = nameTag ? nameTag.Value : "Sem nome";
        
        console.log(`\n--------------------------------------------`);
        console.log(`🖥️ Instância: ${name}`);
        console.log(`🆔 ID da Instância: ${inst.InstanceId}`);
        console.log(`⚡ Status Atual: ${inst.State.Name}`);
        console.log(`📍 IP Público Atual: ${inst.PublicIpAddress || "Nenhum IP público atribuído"}`);
        console.log(`🔒 Chave SSH associada: ${inst.KeyName}`);
        console.log(`🛡️ Grupos de Segurança: ${inst.SecurityGroups.map(sg => `${sg.GroupName} (${sg.GroupId})`).join(", ")}`);
        console.log(`--------------------------------------------`);
      });
    });

  } catch (err) {
    console.error("❌ Erro ao consultar AWS:", err);
  }
}

checkStatus();
