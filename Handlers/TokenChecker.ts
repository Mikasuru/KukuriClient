import { Client } from "discord.js-selfbot-v13";
import { Logger } from "../Utils/Logger";

export const CheckToken = async (tokens: string[]) => {
  Logger.log(`Checking ${tokens.length} token(s)...`);
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    const partialToken = `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
    try {
      const client = new Client();
      await Promise.race([
          client.login(token),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Login timed out')), 15000))
      ]);
      validTokens.push(partialToken);
      client.destroy();
    } catch (error: any) {
      invalidTokens.push(partialToken);
    }
  }
  Logger.log(`Token check complete. Valid: ${validTokens.length}.`);
  if (validTokens.length === 0 && tokens.length > 0) {
      Logger.error("CRITICAL: No valid tokens found. Exiting.");
      process.exit(1);
  }
};
