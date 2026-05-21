const fs = require("fs");
const path = require("path");
const { 
  EC2Client, 
  CreateSecurityGroupCommand, 
  AuthorizeSecurityGroupIngressCommand, 
  CreateKeyPairCommand, 
  DeleteKeyPairCommand,
  RunInstancesCommand, 
  DescribeInstancesCommand 
} = require("@aws-sdk/client-ec2");

// 1. Carregar variáveis de ambiente locais do .env.local de forma segura
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
  console.error("❌ Erro: Chave AWS_CLOUD_FREE_TIER_KEY não encontrada no arquivo .env.local.");
  process.exit(1);
}

// 2. Inicializar cliente AWS EC2 na Região us-east-1
const region = "us-east-1";
const ec2 = new EC2Client({
  region,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  }
});

// Nome de recursos padrão para o deploy
const groupName = "cosmosdaily-security-group";
const keyName = "cosmosdaily-key-pair";
const keyLocalPath = path.join(__dirname, "..", "cosmosdaily-key.pem");

// Payload shell altamente seguro injetado no boot do Ubuntu
const userDataScript = `#!/bin/bash
# CosmosDaily VPS Security & Bootstrap Script
export DEBIAN_FRONTEND=noninteractive

# 1. Atualizar SO e instalar ferramentas essenciais de segurança
apt-get update -y
apt-get upgrade -y
apt-get install -y git curl ufw fail2ban unattended-upgrades

# 2. Configurar Firewall (UFW) com políticas rígidas
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 3. Habilitar Fail2Ban contra ataques de força bruta no SSH
systemctl enable fail2ban
systemctl start fail2ban

# 4. Configurar Atualizações de Segurança diárias Automáticas (LGPD e CVEs)
echo 'APT::Periodic::Update-Package-Lists "1";' > /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' >> /etc/apt/apt.conf.d/20auto-upgrades

# 5. Endurecer Segurança do SSH (Desabilitar login por senha, permitir APENAS chave privada PEM)
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
systemctl restart sshd

# 6. Instalar Node.js v20 (LTS) e PM2 de forma segura
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 7. Instalar e blindar Proxy Reverso Nginx contra escaneamentos maliciosos
apt-get install -y nginx

cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Ocultar assinatura do Nginx (evita que hackers saibam a versão exata do seu servidor)
    server_tokens off;

    # Cabeçalhos de Segurança Estritos (Anti-Clickjacking, Anti-XSS e Sniffing)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

systemctl restart nginx
console.log("🚀 Bootstrap de Segurança Concluído com Sucesso!")
`;

async function deploy() {
  console.log("🌌 Iniciando Provisionamento da VPS CosmosDaily na AWS...");

  // Passo 1: Criar Grupo de Segurança se necessário
  let groupId;
  try {
    const createSg = await ec2.send(new CreateSecurityGroupCommand({
      GroupName: groupName,
      Description: "Grupo de seguranca blindado para o CosmosDaily SaaS",
    }));
    groupId = createSg.GroupId;
    console.log(`✅ Grupo de Segurança criado: ${groupName} (${groupId})`);

    // Definir regras de entrada: SSH (22), HTTP (80), HTTPS (443)
    await ec2.send(new AuthorizeSecurityGroupIngressCommand({
      GroupId: groupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "SSH Acesso Remoto" }],
        },
        {
          IpProtocol: "tcp",
          FromPort: 80,
          ToPort: 80,
          IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "HTTP Trafego" }],
        },
        {
          IpProtocol: "tcp",
          FromPort: 443,
          ToPort: 443,
          IpRanges: [{ CidrIp: "0.0.0.0/0", Description: "HTTPS Trafego Criptografado" }],
        },
      ],
    }));
    console.log("✅ Regras de entrada liberadas com segurança!");
  } catch (err) {
    if (err.name === "InvalidGroup.Duplicate") {
      console.log(`ℹ️ Grupo de Segurança '${groupName}' já existe. Reutilizando...`);
      // Puxa o ID do grupo existente
      const describeSg = await ec2.send(new DescribeInstancesCommand({}));
      // AWS gerencia automaticamente o vinculo se usarmos o nome
    } else {
      console.error("❌ Erro ao configurar Grupo de Segurança:", err);
      process.exit(1);
    }
  }

  // Passo 2: Criar chave SSH criptografada
  console.log("🔑 Gerando par de chaves SSH seguro...");
  try {
    // Exclui a chave antiga na nuvem se houver
    await ec2.send(new DeleteKeyPairCommand({ KeyName: keyName })).catch(() => {});
    
    // Evita bloqueio de gravação no Windows se o arquivo for somente leitura
    if (fs.existsSync(keyLocalPath)) {
      try {
        fs.chmodSync(keyLocalPath, 0o666);
        fs.unlinkSync(keyLocalPath);
      } catch (e) {}
    }

    const keyPair = await ec2.send(new CreateKeyPairCommand({ KeyName: keyName }));
    fs.writeFileSync(keyLocalPath, keyPair.KeyMaterial, { mode: 0o400 });
    console.log(`✅ Chave SSH gravada localmente em: ${keyLocalPath}`);
  } catch (err) {
    console.error("❌ Falha ao criar chave SSH:", err);
    process.exit(1);
  }

  // Passo 3: Provisionar a Instância EC2
  console.log("☁️ Disparando instância EC2 (Ubuntu 24.04 LTS Free Tier)...");
  // AMI estável do Ubuntu 24.04 LTS x86_64 na região us-east-1
  const ubuntuAmi = "ami-0866a3c8686eaeeba"; 
  
  try {
    const userDataBase64 = Buffer.from(userDataScript).toString("base64");
    const runResult = await ec2.send(new RunInstancesCommand({
      ImageId: ubuntuAmi,
      InstanceType: "t3.micro", // Elegível para o nível gratuito em contas novas
      KeyName: keyName,
      MinCount: 1,
      MaxCount: 1,
      SecurityGroups: [groupName],
      UserData: userDataBase64,
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: [{ Key: "Name", Value: "CosmosDaily-SaaS" }],
        },
      ],
    }));

    const instanceId = runResult.Instances[0].InstanceId;
    console.log(`🚀 Instância iniciada com ID: ${instanceId}`);

    // Passo 4: Aguardar IP Público ser associado
    console.log("⏳ Aguardando a AWS associar o IP público à VPS...");
    let publicIp = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 7000));
      const descResult = await ec2.send(new DescribeInstancesCommand({
        InstanceIds: [instanceId],
      }));
      publicIp = descResult.Reservations[0].Instances[0].PublicIpAddress;
      if (publicIp) break;
    }

    if (!publicIp) {
      console.log("⚠️ A AWS demorou para responder o IP. Por favor, cheque seu console AWS EC2.");
      process.exit(0);
    }

    console.log("\n========================================================");
    console.log("🎉 VPS COSMOSDAILY PROVISIONADA COM SUCESSO!");
    console.log("========================================================");
    console.log(`📍 IP Público do Servidor: ${publicIp}`);
    console.log(`🔑 Chave SSH: ${keyLocalPath}`);
    console.log("🛡️ Firewall e Políticas de Segurança Habilitadas.");
    console.log("========================================================");
    console.log("\n💻 Como se conectar via Terminal/PowerShell:");
    console.log(`ssh -i "${keyLocalPath}" ubuntu@${publicIp}`);
    console.log("\n📂 Para rodar seu SaaS na VPS, siga os passos no walkthrough!");
    console.log("========================================================\n");

  } catch (err) {
    console.error("❌ Falha no provisionamento do servidor EC2:", err);
    process.exit(1);
  }
}

deploy();
