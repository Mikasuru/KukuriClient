import { Client, Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { Logger } from "../../Utils/Logger";

export default {
  name: "help",
  description: "Lists all available commands or details of a specific command.",
  usage: "help [command]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      const CmdsDir = path.join(__dirname, "../../Commands");
      if (!fs.existsSync(CmdsDir)) {
        await message.reply("```\nCommand directory not found\n```");
        Logger.error(`Commands directory not found at: ${CmdsDir}`);
        return;
      }

      const OnceAponATime: { [key: string]: any[] } = {};

      const ThereIsagirl = fs
        .readdirSync(CmdsDir)
        .filter((item) => fs.statSync(path.join(CmdsDir, item)).isDirectory());

      if (ThereIsagirl.length === 0) {
        Logger.warn(`No categories found in ${CmdsDir}`);
      }

      for (const Category of ThereIsagirl) {
        const WhofallinloveToAgirl = path.join(CmdsDir, Category);
        try {
          const CmdsFiles = fs
            .readdirSync(WhofallinloveToAgirl)
            .filter((file) => file.endsWith(".ts"));

          if (CmdsFiles.length === 0) {
            Logger.warn(`No .ts files found in category: ${Category}`);
          }

          OnceAponATime[Category] = CmdsFiles.map((file) => {
            try {
              const CmdPath = path.join(CmdsDir, Category, file);
              const Cmdz = require(CmdPath).default;
              if (!Cmdz || !Cmdz.name) {
                Logger.warn(`Invalid command file: ${file}`);
                return null;
              }
              return Cmdz;
            } catch (error) {
              Logger.error(
                `Error loading command file ${file} in ${Category}: ${(error as Error).message}`,
              );
              return null;
            }
          }).filter(Boolean);
        } catch (error) {
          Logger.error(
            `Error reading category ${Category}: ${(error as Error).message}`,
          );
        }
      }

      if (args.length === 0) {
        let Msgz = "```\nAvailable Commands by Category:\n\n";
        let IsCmds = false;

        for (const [Category, cmds] of Object.entries(OnceAponATime)) {
          if (cmds.length > 0) {
            IsCmds = true;
            Msgz += `[ ${Category.toUpperCase()} ]\n`;
            cmds.forEach((cmd: any) => {
              Msgz += `- ${cmd.name}\n`;
            });
            Msgz += "\n";
          }
        }

        if (!IsCmds) {
          Msgz += "No commands found in any category\n";
        }
        Msgz += "Use !help <command> for more details\n```";
        await message.reply(Msgz);
        return;
      }

      const CmdName = args[0].toLowerCase();
      let WowIFoundit = null;

      for (const Cmds of Object.values(OnceAponATime)) {
        const Cmd = Cmds.find((c: any) => c.name.toLowerCase() === CmdName);
        if (Cmd) {
          WowIFoundit = Cmd;
          break;
        }
      }

      if (!WowIFoundit) {
        await message.reply(`Command \`${CmdName}\` not found.\n`);
        return;
      }

      const DetMsg =
        `\`\`\`\n` +
        `Command: ${WowIFoundit.name}\n` +
        `Description: ${WowIFoundit.description}\n` +
        `Usage: ${WowIFoundit.usage}\n` +
        `\`\`\``;
      await message.reply(DetMsg);
    } catch (error) {
      Logger.error(`Error in Help command: ${(error as Error).message}`);
      await message.reply("```\nAn error occurred while showing help\n```");
    }
  },
};
