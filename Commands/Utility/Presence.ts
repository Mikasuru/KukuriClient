import { Client, Message } from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

const ActivityType = {
  PLAYING: "PLAYING",
  STREAMING: "STREAMING",
  LISTENING: "LISTENING",
  WATCHING: "WATCHING",
  CUSTOM: "CUSTOM",
  COMPETING: "COMPETING",
  HANG: "HANG",
} as const;

export default {
  name: "presence",
  description: "Change your presence",
  usage: "!presence <type> <platform> <status> <name>",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (args.length === 1 && args[0].toLowerCase() === "stop") {
        client.user.setPresence({
          activities: [{ name: "Kukuri Client", type: "HANG" }],
          status: "online",
        });
        message.reply("Your presence have been disabled");
        return;
      }

      if (args.length < 4) {
        return message.reply(
          "Usage: !presence <type> <platform> <status> <name>",
        );
      }

      const Type = args[0].toUpperCase();
      const Platform = args[1].toLowerCase();
      const Status = args[2].toLowerCase();
      const Name = args.slice(3).join(" ");

      const VaildTypes = Object.keys(ActivityType);
      const VaildPF = [
        "desktop",
        "samsung",
        "xbox",
        "ios",
        "android",
        "embedded",
        "ps4",
        "ps5",
      ];
      const VaildStatus = ["online", "idle", "dnd"];

      if (!VaildTypes.includes(Type)) {
        return message.reply(
          `Invalid type. Available types: ${VaildTypes.join(", ")}`,
        );
      }

      if (!VaildPF.includes(Platform)) {
        return message.reply(
          `Invalid platform. Available platforms: ${VaildPF.join(", ")}`,
        );
      }

      if (!VaildStatus.includes(Status)) {
        return message.reply(
          `Invalid status. Available statuses: online, idle, dnd`,
        );
      }

      client.user.setPresence({
        activities: [{ name: Name, type: Type as keyof typeof ActivityType }],
        status: Status as "online" | "idle" | "dnd",
        platform: Platform,
      });

      message.reply(
        `Presence updated to **${Type}** on **${Platform}** with **${Status}** status and name **${Name}**!`,
      );
    } catch (error) {
      Logger.error(`Presence error: ${error}`);
      message.reply("An error occurred while updating presence.");
    }
  },
};
