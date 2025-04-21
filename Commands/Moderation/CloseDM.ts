import { Message, DMChannel } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { ParseUsr } from "../../Utils/DiscordUtils";
import { SendEditRep, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { delay } from "../../Utils/MiscUtils";

export default {
  name: "closedm",
  description: "Close DM channels with a user or all users",
  usage: "closedm <@user/userid | all>",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    let editMessage: Message | null = null;
    try {
      if (!args[0]) {
        await message.reply(CodeBlock(`Usage: ${client.prefix}${exports.default.usage}\nExample: ${client.prefix}closedm @user or ${client.prefix}closedm all`));
        return;
      }

      const targetArg = args[0].toLowerCase();

      if (targetArg === "all") {
        editMessage = await SendEditRep(message, "Closing all DM channels...");
        if (!editMessage) return;

        const dmChannels = client.channels.cache.filter(
          (channel): channel is DMChannel => channel instanceof DMChannel
        );
        let closedCount = 0;

        for (const [, channel] of dmChannels) {
          try {
            if (channel.recipient) {
                 await channel.delete();
                 closedCount++;
                 await delay(200); // Small delay
            }
          } catch (error) {
            Logger.error(`Error closing DM channel ${channel.id} with ${channel.recipient?.tag}: ${error}`);
          }
        }
        await editMessage.edit(CodeBlock(`Successfully closed ${closedCount} DM channels.`));

      } else {
        const targetUser = await ParseUsr(client, args[0], message);
        if (!targetUser || targetUser.id === message.author.id) {
             await message.reply(CodeBlock("Invalid user mention or ID provided."));
             return;
        }

        editMessage = await SendEditRep(message, `Closing DM channel with ${targetUser.tag}...`);
        if (!editMessage) return;

        const dmChannel = client.channels.cache.find(
            ch => ch instanceof DMChannel && ch.recipient?.id === targetUser.id
        ) as DMChannel | undefined;


        if (dmChannel) {
          try {
            await dmChannel.delete();
            await editMessage.edit(CodeBlock(`Successfully closed DM channel with ${targetUser.tag}`));
          } catch (error) {
            Logger.error(`Error closing DM channel with ${targetUser.tag}: ${error}`);
            await editMessage.edit(CodeBlock(`Failed to close DM channel with ${targetUser.tag}. It might already be closed or an error occurred.`));
          }
        } else {
          await editMessage.edit(CodeBlock(`Could not find an active DM channel with ${targetUser.tag}.`));
        }
      }
    } catch (error) {
      const errorMsg = "An error occurred while closing DM channels.";
      if (editMessage) {
          try { await editMessage.edit(CodeBlock(errorMsg)); } catch {}
      }
      await HandleError(error, exports.default.name, message, errorMsg);
    }
  },
};