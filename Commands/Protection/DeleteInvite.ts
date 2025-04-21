import {
  Message,
  TextChannel,
  DMChannel
} from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { SendEditRep, FetchChMsg, SafeDelMsg, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { delay } from "../../Utils/MiscUtils";

export default {
  name: "deleteinvite",
  description:
    "Deletes your messages containing URLs (including Discord invites) sent within the last 7 days across accessible servers and DMs.",
  usage: "deleteinvite",
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    let editMessage: Message | null = null;
    try {
      if (!client.user) {
        await message.reply(CodeBlock("Client is not fully initialized yet."));
        return;
      }

      editMessage = await SendEditRep(message, CodeBlock("Checking for your messages containing URLs (last 7 days)..."));
      if (!editMessage) return;

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const urlRegex = /(discord\.gg\/[a-zA-Z0-9]+|https?:\/\/[^\s]+)/i;
      let totalDeletedCount = 0;
      let checkedGuilds = 0;
      let checkedDMs = 0;

      const guilds = Array.from(client.guilds.cache.values());
      Logger.log(`Checking ${guilds.length} guilds...`);

      for (const guild of guilds) {
        checkedGuilds++;
        if (checkedGuilds % 5 === 0 || checkedGuilds === guilds.length) {
           await editMessage.edit(CodeBlock(`Checked ${checkedGuilds}/${guilds.length} guilds... Deleted ${totalDeletedCount} messages so far...`)).catch(Logger.warn);
        }

        const textChannels = guild.channels.cache.filter(
          (ch): ch is TextChannel => ch instanceof TextChannel
        );

        for (const [, channel] of textChannels) {
          try {
            const messages = await FetchChMsg(channel, 100);
            if (!messages) continue;

            const messagesToDelete = Array.from(messages.values()).filter(
              (msg) =>
                msg.author.id === client.user?.id &&
                urlRegex.test(msg.content) &&
                msg.createdTimestamp > sevenDaysAgo
            );

            for (const msg of messagesToDelete) {
              await SafeDelMsg(msg);
              totalDeletedCount++;
              await delay(150);
            }
          } catch (channelError) {
            Logger.warn(`Could not process channel ${channel.name} (${channel.id}) in guild ${guild.name}: ${channelError}`);
          }
        }
         await delay(300);
      }

      const dmChannels = client.channels.cache.filter(
        (ch): ch is DMChannel => ch instanceof DMChannel
      );
      Logger.log(`Checking ${dmChannels.size} DM channels...`);
      await editMessage.edit(CodeBlock(`Finished guilds. Now checking ${dmChannels.size} DMs... Deleted ${totalDeletedCount} messages so far...`)).catch(Logger.warn);


      for (const [, channel] of dmChannels) {
        checkedDMs++;
        if (checkedDMs % 20 === 0 || checkedDMs === dmChannels.size) {
           await editMessage.edit(CodeBlock(`Checked ${checkedDMs}/${dmChannels.size} DMs... Deleted ${totalDeletedCount} messages so far...`)).catch(Logger.warn);
        }

        try {
            const messages = await FetchChMsg(channel, 100);
            if (!messages) continue;

            const messagesToDelete = Array.from(messages.values()).filter(
              (msg) =>
                msg.author.id === client.user?.id &&
                urlRegex.test(msg.content) &&
                msg.createdTimestamp > sevenDaysAgo
            );

            for (const msg of messagesToDelete) {
               await SafeDelMsg(msg);
               totalDeletedCount++;
               await delay(150);
            }
        } catch (dmError) {
             Logger.warn(`Could not process DM channel ${channel.id}: ${dmError}`);
        }
      }

      const finalMessage = totalDeletedCount === 0
        ? "No messages containing URLs found from you within the last 7 days."
        : `Finished! Deleted ${totalDeletedCount} message(s) containing URLs.`;
      await editMessage.edit(CodeBlock(finalMessage));
      Logger.log(finalMessage);

    } catch (error) {
      const errorMsg = "An error occurred while checking/deleting messages.";
       if (editMessage) {
           try { await editMessage.edit(CodeBlock(errorMsg)); } catch {}
       }
      await HandleError(error, exports.default.name, message, errorMsg);
    }
  },
};
