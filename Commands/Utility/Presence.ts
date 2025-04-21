import { Message } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { SendTempRep, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";

const VaildActTypes = [
  "PLAYING", "STREAMING", "LISTENING", "WATCHING", "CUSTOM", "COMPETING"
] as const;
type ActivityType = typeof VaildActTypes[number];

const VaildPlatforms = [
  "desktop", "web", "mobile"
] as const;
type PlatformType = typeof VaildPlatforms[number];

const VaildStatus = ["online", "idle", "dnd"] as const;
type StatusType = typeof VaildStatus[number];

const commandDefinition = {
  name: "presence",
  description: "Change your Discord presence (status, activity, platform).",
  usage: "presence <type> <platform> <status> <name...> | presence stop",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    const commandName = commandDefinition.name;
    try {
      if (args.length === 1 && args[0].toLowerCase() === "stop") {
        try {
          client.user?.setPresence({
             activities: [],
             status: "online",
          });
          await SendTempRep(message, "✅ Custom presence stopped (reset to default/online).");
        } catch (presenceError) {
             Logger.error(`Failed to stop presence: ${presenceError}`);
             await SendTempRep(message, "⚠️ Could not fully reset presence, but cleared settings.");
        }
        return;
      }

      if (args.length < 4) {
        await SendTempRep(message, CodeBlock(`Invalid arguments. Usage: ${client.prefix}${commandDefinition.usage}`));
        return;
      }

      const typeArg = args[0].toUpperCase();
      const platformArg = args[1].toLowerCase();
      const statusArg = args[2].toLowerCase();
      const name = args.slice(3).join(" ");

      if (!(VaildActTypes as ReadonlyArray<string>).includes(typeArg)) {
          await SendTempRep(message, CodeBlock(`Invalid type "${typeArg}".\nAvailable: ${VaildActTypes.join(", ")}`));
          return;
      }
      const type = typeArg as ActivityType;

      if (!(VaildPlatforms as ReadonlyArray<string>).includes(platformArg)) {
          await SendTempRep(message, CodeBlock(`Invalid platform "${platformArg}".\nAvailable: ${VaildPlatforms.join(", ")}`));
          return;
      }
       const platform = platformArg as PlatformType;

      if (!(VaildStatus as ReadonlyArray<string>).includes(statusArg)) {
           await SendTempRep(message, CodeBlock(`Invalid status "${statusArg}".\nAvailable: ${VaildStatus.join(", ")}`));
          return;
      }
       const status = statusArg as StatusType;

      client.user?.setPresence({
        activities: [{
            name: name,
            type: type as any,
        }],
        status: status,
      });

      await SendTempRep(message, `Presence updated: ${type} "${name}" on ${platform} (${status})`);

    } catch (error) {
      await HandleError(error, commandName, message, "An error occurred while updating presence.");
    }
  },
};

export default commandDefinition;