import { Client, Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { Logger } from "../Utils/Logger";
import { SendTempRep } from "../Utils/MessageUtils";

interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (client: ClientInit, message: Message, args: string[]) => void | Promise<void>;
}

export class ClientInit extends Client {
  prefix: string;
  allowUsers: string[] | "all";
  commands: Map<string, Command> = new Map();

  afkStatus: Map<string, string> = new Map<string, string>();
  autoReactConfig: { enabled: boolean; emoji: string } = { enabled: false, emoji: "" };

  constructor(
    prefix: string,
    allowUsers: string[] | "all"
  ) {
    super();
    this.prefix = prefix;
    this.allowUsers = allowUsers;
    this.LoadCommands();
  }

  async start(token: string) {
    try {
      await this.login(token);
      Logger.log(`Logged in as ${this.user?.tag}`);

      this.on("messageCreate", (message) => {
        message.mentions.users.forEach(mentionedUser => {
          if (this.afkStatus.has(mentionedUser.id)) {
            if (message.author.id !== this.user?.id && message.author.id !== mentionedUser.id) {
              const reason = this.afkStatus.get(mentionedUser.id) || "AFK";
              SendTempRep(message, `User ${mentionedUser.tag} is currently AFK. Reason: ${reason}`, 5000)
                .catch(Logger.error);
            }
          }
        });

        if (this.autoReactConfig.enabled && this.autoReactConfig.emoji) {
           if(message.author.id !== this.user?.id) {
               message.react(this.autoReactConfig.emoji).catch((err) => {
                   Logger.warn(`Failed to auto-react: ${err}`);
               });
           }
        }
        this.HandleMessage(message);

      });
      // --------------------------------------------------------------

    } catch (error) {
      Logger.error(`Failed to login for token associated with prefix "${this.prefix}". Error: ${error}`);
    }
  }

  LoadCommands() {
    const commandsDir = path.join(__dirname, "../Commands");

    const loadDir = (dir: string) => {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    loadDir(fullPath); // Recursively load subdirectories
                } else if (item.isFile() && (item.name.endsWith(".ts") || item.name.endsWith(".js"))) {
                    try {
                        const commandModule = require(fullPath);
                        const command: Command = commandModule.default || commandModule;

                        if (command && command.name && typeof command.execute === 'function') {
                            this.commands.set(command.name.toLowerCase(), command);
                             Logger.log(`Loaded command: ${command.name}`);
                        } else {
                            Logger.warn(`Skipping invalid command file: ${item.name} (missing name, description, usage, or execute function)`);
                        }
                    } catch (error) {
                         Logger.error(`Failed to load command from ${item.name}: ${error}`);
                    }
                }
            }
        } catch (error) {
             Logger.error(`Failed to read command directory ${dir}: ${error}`);
        }
    };

    loadDir(commandsDir);
     Logger.log(`Total commands loaded: ${this.commands.size}`);
  }


  HandleMessage(Msg: Message) {
    if (Msg.author.id !== this.user?.id) return;
    if (!Msg.content.startsWith(this.prefix)) return;

    const Args = Msg.content.slice(this.prefix.length).trim().split(/\s+/);
    const CmdName = Args.shift()?.toLowerCase();

    if (!CmdName) return;

    if (this.allowUsers !== "all" && !this.allowUsers.includes(Msg.author.id)) {
       return;
    }

    const command = this.commands.get(CmdName);
    if (!command) return;

    try {
      command.execute(this, Msg, Args);
    } catch (error) {
      Logger.error(`Error executing command ${CmdName}: ${error}`);
       Msg.reply(`❌ An error occurred while executing command: ${CmdName}`).catch(Logger.error);
    }
  }
}
