import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import axios from "axios";
import { Logger } from "../../Utils/Logger";
import { HandleError } from "../../Utils/ErrorUtils";
import { SendEditRep, CodeBlock } from "../../Utils/MessageUtils";

export default {
  name: "speedtest",
  description:
    "Tests internet download speed using Cloudflare.",
  usage: "speedtest",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    let editMessage: Message | null = null;
    try {
      editMessage = await SendEditRep(message, "Running internet speed test... Please wait.");
      if (!editMessage) {
          Logger.error("Failed to send initial speedtest message.");
          return;
      }

      const startTime = Date.now();
      const response = await axios.get(
        "https://speed.cloudflare.com/__down?bytes=50000000", // 50MB
        {
          responseType: "arraybuffer",
          timeout: 20000,
        },
      );
      const endTime = Date.now();

      const durationSeconds = (endTime - startTime) / 1000;
      const sizeMegabits = (response.data.byteLength / (1024 * 1024)) * 8;

      if (durationSeconds === 0) {
          await editMessage.edit(CodeBlock("Speed test duration too short, unable to calculate speed."));
          return;
      }

      const downloadSpeedMbps = (sizeMegabits / durationSeconds).toFixed(2); // Mbps

      const resultText =
        `📊 Internet Speed Test Results (Cloudflare):\n\n` +
        `- Download: ${downloadSpeedMbps} Mbps\n` +
        `- Time Taken: ${durationSeconds.toFixed(2)} s\n` +
        `- Data Size: ${(sizeMegabits / 8).toFixed(2)} MB\n\n` +
        `Note: Upload/Ping tests not available.`;

      await editMessage.edit(CodeBlock(resultText));

    } catch (error) {
       const errorMsg = `Failed to run speed test. Check connection or Cloudflare status.`;
       if (editMessage) {
           try {
               await editMessage.edit(CodeBlock(errorMsg));
           } catch (editError) {
                await HandleError(error, exports.default.name, message, errorMsg);
           }
       } else {
            await HandleError(error, exports.default.name, message, errorMsg);
       }
       Logger.error(`Speedtest error: ${error}`);
    }
  },
};
