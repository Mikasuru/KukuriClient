import { Client, Message } from "discord.js-selfbot-v13";
import axios from "axios";

export default {
  name: "speedtest",
  description:
    "Tests your internet download speed using a simple HTTP request.",
  usage: "speedtest",
  execute: async (client: Client, message: Message, args: string[]) => {
    const TestMSG = await message.reply(
      "Running internet speed test... Please wait.",
    );

    try {
      const StartTime = Date.now();
      const Res = await axios.get(
        "https://speed.cloudflare.com/__down?bytes=10000000",
        {
          responseType: "arraybuffer",
        },
      );
      const EndPlease = Date.now();

      const TimeTaken = (EndPlease - StartTime) / 1000;
      const ASize = 10;
      const DownloadSpeed = ((ASize * 8) / TimeTaken).toFixed(2); // Mbps

      await TestMSG.edit(
        `**Internet Speed Test Results:**\n` +
          `- Download: \`${DownloadSpeed} Mbps\`\n` +
          `- Note: Upload and Ping tests are not available in this mode.`,
      );
    } catch (error) {
      await TestMSG.edit("Failed to run speed test. Check your connection.");
      console.error("Speedtest error:", error);
    }
  },
};
