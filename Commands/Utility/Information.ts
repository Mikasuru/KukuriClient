import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import si from "systeminformation";
import os from "os";
import { Logger } from "../../Utils/Logger";
import { CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";

async function getGpuInfo(): Promise<string> {
  try {
    const gpuData = await si.graphics();
    if (gpuData && gpuData.controllers && gpuData.controllers.length > 0) {
        return gpuData.controllers
            .map((gpu) => `${gpu.vendor || ''} ${gpu.model || 'Unknown GPU'}`.trim())
            .join(", ") || "N/A";
    }
    return "No GPU detected";
  } catch (error) {
    Logger.warn(`Could not detect GPU: ${error}`);
    return "Unable to detect GPU";
  }
}

function getHostingType(): string {
  const hostname = os.hostname().toLowerCase();
  const virtualizationKeywords = ["vps", "vm", "cloud", "aws", "gcp", "azure", "kvm", "qemu", "virtualbox", "vmware", "hyper-v", "docker", "container"];

  if (virtualizationKeywords.some((keyword) => hostname.includes(keyword) || (os.version && os.version().toLowerCase().includes(keyword)))) {
      return "Virtual Environment / Cloud / VPS";
  }
  return "Local Machine / Unknown";
}


export default {
  name: "information",
  description: "Get detailed information about the client and system.",
  usage: "information",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      // Uptime Calculation
      const uptimeSeconds = process.uptime();
      const days = Math.floor(uptimeSeconds / (3600 * 24));
      const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // System Info
      const bunVersion = typeof Bun !== 'undefined' ? Bun.version : "N/A"; // Check if Bun exists
      const platform = os.platform();
      const release = os.release();
      const arch = os.arch();

      // Memory
      const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);
      const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(2);

      // CPU Info
      const cpus = os.cpus();
      const cpuModel = cpus.length > 0 ? cpus[0].model : "N/A";
      const cpuCores = cpus.length;
      const cpuSpeed = cpus.length > 0 ? (cpus[0].speed / 1000).toFixed(2) : "N/A"; // Current speed

      let cpuMaxSpeed = "N/A";
      try {
          const cpuData = await si.cpu();
          cpuMaxSpeed = cpuData.speedMax ? cpuData.speedMax.toFixed(2) : cpuSpeed;
      } catch (siError) {
          Logger.warn(`Could not get max CPU speed from systeminformation: ${siError}`);
          cpuMaxSpeed = cpuSpeed;
      }


      const gpuInfo = await getGpuInfo();
      const hostingType = getHostingType();

      const infoContent = `
Client User: ${client.user?.tag || "Unknown"}

[ BOT STATUS ]
- Uptime       : ${uptimeString}
- Bun Version  : ${bunVersion}

[ SYSTEM INFO ]
- OS Platform  : ${platform}
- OS Release   : ${release}
- Architecture : ${arch}
- Hosting Type : ${hostingType}

[ HARDWARE ]
- CPU Model    : ${cpuModel}
- CPU Cores    : ${cpuCores}
- CPU Speed    : ${cpuSpeed} GHz (Max: ${cpuMaxSpeed} GHz)
- GPU(s)       : ${gpuInfo}
- Total Memory : ${totalMemGB} GB
- Free Memory  : ${freeMemGB} GB
      `;

      await message.reply(CodeBlock(infoContent.trim(), 'ini'));

    } catch (error) {
      await HandleError(error, exports.default.name, message);
    }
  },
};
