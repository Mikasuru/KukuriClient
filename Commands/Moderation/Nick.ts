import { Message, GuildMember } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { EnsureGC, ParseMbr, CheckManageable } from "../../Utils/DiscordUtils";
import { getRandomElement } from "../../Utils/MiscUtils";
import { SendTempRep, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";

const adjectives = ["Sigma", "Maxxing", "Alpha", "Skibidi", "Ohio", "Rizzler"];
const nouns = ["Toilet", "Skibidi", "Wolf", "Kukuri"]; // Fun names

export default {
  name: "nick",
  description: "Manage user nicknames",
  usage: "nick <set|reset|random> <@user/userid> [nickname]",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    try {
      if (!await EnsureGC(message)) return;

      const action = args[0]?.toLowerCase();
      const targetArg = args[1];
      const potentialNick = args.slice(2).join(" ");

      if (!action || !targetArg || (action === "set" && !potentialNick)) {
        await SendTempRep(message, CodeBlock(
            `Invalid arguments. Usage:\n`+
            `${client.prefix}nick set <@user/userid> <nickname>\n` +
            `${client.prefix}nick reset <@user/userid>\n` +
            `${client.prefix}nick random <@user/userid>`
            )
        );
        return;
      }

      const member = await ParseMbr(message, targetArg);
      if (!member) {
           await SendTempRep(message, `Could not find the specified member.`);
           return;
      }

      if (!await CheckManageable(message, member, 'change nickname for')) return;

      switch (action) {
        case "set": {
          if (potentialNick.length > 32) {
            await SendTempRep(message, "Nickname must be 32 characters or less.");
            return;
          }
          await member.setNickname(potentialNick);
          await SendTempRep(message, `Changed ${member.user.username}'s nickname to "${potentialNick}".`);
          break;
        }
        case "reset": {
          const oldNick = member.nickname;
          await member.setNickname(null);
           await SendTempRep(message, `Reset ${member.user.username}'s nickname${oldNick ? ` from "${oldNick}"` : ""}.`);
          break;
        }
        case "random": {
          const randomAdj = getRandomElement(adjectives) || "Cool";
          const randomNoun = getRandomElement(nouns) || "User";
          const randomNick = `${randomAdj} ${randomNoun}`;
          await member.setNickname(randomNick);
           await SendTempRep(message, `Changed ${member.user.username}'s nickname to "${randomNick}".`);
          break;
        }
        default: {
          await SendTempRep(message, `Invalid action "${action}". Use 'set', 'reset', or 'random'.`);
        }
      }

    } catch (error) {
      await HandleError(error, exports.default.name, message, "An error occurred while managing nickname.");
    }
  },
};
