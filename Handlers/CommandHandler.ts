import { Client, Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { Logger } from "../Utils/Logger";

const commands: Map<
  string,
  (client: Client, message: Message, args: string[]) => void
> = new Map();

export const LoadCommands = () => {
  const CmdFiles = fs
    .readdirSync(path.join(__dirname, "../Commands"))
    .filter((file) => file.endsWith(".ts"));
  for (const file of CmdFiles) {
    const command = require(`../Commands/${file}`).default;
    commands.set(command.name, command.execute);
  }
};

export const HandleCommand = (
  client: Client,
  message: Message,
  prefix: string,
) => {
  if (message.author.id !== client.user?.id) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const CmdName = args.shift()?.toLowerCase();

  if (!CmdName || !commands.has(CmdName)) return;
  try {
    commands.get(CmdName)?.(client, message, args);
  } catch (error) {
    Logger.error(`Error executing command ${CmdName}: ${error}`);
  }
};
