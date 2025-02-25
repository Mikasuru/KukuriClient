import { Client, Message } from "discord.js-selfbot-v13";
import si from "systeminformation";
import os from "os";

async function GPU(): Promise<string> {
  try {
    const GPUData = await si.graphics();
    return (
      GPUData.controllers
        .map((gpu) => `\n${gpu.vendor} ${gpu.model}`)
        .join(", ") || "No GPU detected"
    );
  } catch (error) {
    return "Unable to detect GPU";
  }
}

export default {
  name: "information",
  description: "Get detailed information about the bot.",
  usage: "information",
  execute: async (client: Client, message: Message, args: string[]) => {
    // Uptime Calculation
    const StartTime =
      process.uptime() === 0
        ? Date.now()
        : Date.now() - process.uptime() * 1000;

    const MS = Date.now() - StartTime;
    const Sec = Math.floor(MS / 1000);
    const Min = Math.floor(Sec / 60);
    const Hrs = Math.floor(Min / 60);
    const Days = Math.floor(Hrs / 24);
    const UptimeString = `${Days}d ${Hrs % 24}h ${Min % 60}m ${Sec % 60}s`;

    // System Info
    const BunVer = Bun.version || "Unknown";
    const Platform = os.platform();
    const Release = os.release();
    const Archbtw = os.arch();

    // Memory
    const TolMem = (os.totalmem() / 1024 ** 3).toFixed(2); // GB
    const FrrrMem = (os.freemem() / 1024 ** 3).toFixed(2); // GB

    // CPU Info
    const Cores = os.cpus().length;
    const Model = os.cpus()[0].model;

    const CData = await si.cpu();
    const CSpeed = (os.cpus()[0].speed / 1000).toFixed(2); // Curr speed
    const CMSpeed = (CData.speedMax || CSpeed).toFixed(2); // Max speed

    const GInfo = await GPU();
    const Hosting = GetHosting();

    const InfoMsg = `
\`\`\`
${client.user?.tag || "Unknown"}'s Information:

[ BOT STATUS ]
- Uptime: ${UptimeString}
- Bun Version: ${BunVer}

[ SYSTEM INFORMATION ]
- OS Platform: ${Platform}
- OS Release: ${Release}
- Architecture: ${Archbtw}
- Hosting Type: ${Hosting}

[ HARDWARE ]
- CPU Model: ${Model}
- CPU Cores: ${Cores}
- CPU Speed: ${CSpeed} GHz (Max: ${CMSpeed} GHz)
- GPU(s): ${GInfo}
- Total Memory: ${TolMem} GB
- Free Memory: ${FrrrMem} GB
\`\`\`
    `;

    await message.reply(InfoMsg);
  },
};

function GetHosting(): string {
  const HN = os.hostname().toLowerCase();

  const VKW = ["vps", "vm", "cloud", "aws", "gcp", "azure"];
  const VPS = VKW.some((keyword) => HN.includes(keyword));

  const Indicators = {
    kvm: "KVM",
    qemu: "QEMU",
    virtualbox: "VirtualBox",
    vmware: "VMware",
    "hyper-v": "Microsoft Hyper-V",
  };

  const SysInfo = os.version?.().toLowerCase() || "";
  const VM = Object.entries(Indicators).find(
    ([key]) => SysInfo.includes(key) || HN.includes(key),
  );

  if (VM) return `VM (${VM[1]})`;
  if (VPS) return "VPS/Cloud";
  return "Local Machine";
}
