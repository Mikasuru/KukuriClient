import { Client, Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { afkStatus } from "../Commands/Basic/AFK";
import { ReactEnable, ReactEmoji } from "../Commands/Utility/AutoReact";
import { Logger } from "../Utils/Logger";

export class ClientInit extends Client {
  prefix: string;
  allowUsers: string[] | "all";
  allowEveryone: boolean;
  commands: Map<
    string,
    (client: Client, message: Message, args: string[]) => void
  > = new Map();

  constructor(
    prefix: string,
    allowUsers: string[] | "all",
    allowEveryone: boolean,
  ) {
    super();
    this.prefix = prefix;
    this.allowUsers = allowUsers;
    this.allowEveryone = allowEveryone;
    this.LoadCommands();
  }

  async start(token: string) {
    try {
      await this.login(token);
      Logger.log(`Logged in as ${this.user?.tag}`);
      this.on("messageCreate", (message) => {
        if (message.mentions.has(this.user?.id || "")) {
          const UserID = message.author.id;
          if (afkStatus.has(UserID)) {
            const Reason = afkStatus.get(UserID);
            message.reply(`I am currently AFK. Reason: ${Reason}`);
          }
        }
        if (ReactEnable && ReactEmoji) {
          message.react(ReactEmoji).catch(() => {
            // Logger.error("Failed to react to the message. Make sure the bot has the required permissions.");
          });
        }
        this.HandleMessage(message);
      });
    } catch (error) {
      Logger.error(`Failed to login with token: ${token}`);
    }
  }

  LoadCommands() {
    const LoadFiles = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          LoadFiles(fullPath);
        } else if (file.endsWith(".ts")) {
          const command = require(fullPath).default;
          if (!command || !command.name || !command.execute) {
            Logger.warn(
              `Skipping invalid command file: ${file} (missing name or execute)`,
            );
            continue;
          }
          this.commands.set(command.name, command.execute);
        }
      }
    };

    LoadFiles(path.join(__dirname, "../Commands"));
  }

  HandleMessage(Msg: Message) {
    if (Msg.author.id !== this.user?.id) return;

    if (!Msg.content.startsWith(this.prefix)) return;

    const Args = Msg.content.slice(this.prefix.length).trim().split(/\s+/);
    const CmdName = Args.shift()?.toLowerCase();

    if (!this.allowEveryone && !this.allowUsers.includes(Msg.author.id)) {
      return Msg.reply("You do not have permission to use this command.");
    }

    if (!CmdName || !this.commands.has(CmdName)) return;
    try {
      this.commands.get(CmdName)?.(this, Msg, Args);
    } catch (error) {
      Logger.error(`Error executing command ${CmdName}: ${error}`);
    }
  }
}
