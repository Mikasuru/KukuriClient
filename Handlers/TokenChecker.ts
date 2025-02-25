import { Client } from "discord.js-selfbot-v13";
import { Logger } from "../Utils/Logger";

export const CheckToken = async (tokens: string[]) => {
  for (const token of tokens) {
    try {
      const client = new Client();
      await client.login(token);
      // Logger.log(`✅ Valid token: ${token}`);
      client.destroy();
    } catch {
      // Fixing soon
    }
  }
};
