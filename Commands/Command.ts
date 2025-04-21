
import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../Types/Client";
import { Logger } from "../Utils/Logger";

export default {
  name: "example",
  description: "This is a example command.",
  usage: "example",

  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {

      // Logic here

    } catch (error) {
      Logger.error(`Error in command '${exports.default.name}': ${error}`);
      await message.reply("An error occurred while executing this command.").catch(Logger.error);
    }
  },
};