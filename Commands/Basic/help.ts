import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { HandleError } from "../../Utils/ErrorUtils";
import { CodeBlock, SendTempRep } from "../../Utils/MessageUtils";

export default {
  name: "help",
  description: "Lists all available commands or details of a specific command.",
  usage: "help [command]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      const prefix = client.prefix;
      const commands = client.commands;

      if (args.length === 0) {
        // List all commands
        if (commands.size === 0) {
          await SendTempRep(message, CodeBlock("No commands available."));
          return;
        }

        let helpMessage = "Available Commands:\n\n";
        commands.forEach(cmd => {
          helpMessage += `${prefix}${cmd.name}: ${cmd.description}\n`;
        });
        helpMessage += `\nUse ${prefix}help <command> for more details.`;

        await message.reply(CodeBlock(helpMessage)); // Use CodeBlock for output

      } else {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName);

        if (!command) {
          await SendTempRep(message, CodeBlock(`Command "${commandName}" not found.\nUse ${prefix}help to see all available commands.`));
          return;
        }

        const detailMessage =
          `Command: ${command.name}\n` +
          `Description: ${command.description}\n` +
          `Usage: ${prefix}${command.usage}`;

        await message.reply(CodeBlock(detailMessage));
      }

    } catch (error) {
      await HandleError(error, exports.default.name, message, "An error occurred while showing help information.");
    }
  },
};
