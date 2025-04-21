import { Message, DMChannel } from "discord.js-selfbot-v13";
import { ClientInit } from "../../Types/Client";
import { Logger } from "../../Utils/Logger";
import { ParseUsr } from "../../Utils/DiscordUtils";
import { SendEditRep, FetchChMsg, SafeDelMsg, CodeBlock } from "../../Utils/MessageUtils";
import { HandleError } from "../../Utils/ErrorUtils";
import { delay } from "../../Utils/MiscUtils";

export default {
  name: "deletedm",
  description: "Delete your messages in DMs with a user or all users",
  usage: "deletedm <@user/userid | all>", 
  execute: async (client: ClientInit, message: Message, args: string[]) => {
    let editMessage: Message | null = null;
    try {
      if (!args[0]) {
        await message.reply(CodeBlock(`Usage: ${client.prefix}${exports.default.usage}\nExample: ${client.prefix}deletedm @user or ${client.prefix}deletedm all`));
        return;
      }

      const targetArg = args[0].toLowerCase();

      if (targetArg === "all") {
        editMessage = await SendEditRep(message, "Deleting all your previous DM messages...");
        if (!editMessage) return;

        const dmChannels = client.channels.cache.filter(
          (channel): channel is DMChannel => channel instanceof DMChannel // Type guard
        );
        let totalDeletedCount = 0;
        let checkedChannels = 0;

        for (const [, channel] of dmChannels) {
            checkedChannels++;
            const messages = await FetchChMsg(channel, 100);
            if (messages) {
                let deletedInChannel = 0;
                for (const msg of messages.values()) {
                    if (msg.author.id === client.user?.id) {
                        await SafeDelMsg(msg);
                        deletedInChannel++;
                        totalDeletedCount++;
                        await delay(150); // Small delay
                    }
                }
                 if (deletedInChannel > 0) {
                     Logger.log(`Deleted ${deletedInChannel} messages in DM with ${channel.recipient?.tag || 'Unknown User'}`);
                 }
            }
             if (checkedChannels % 10 === 0) {
                 await editMessage.edit(CodeBlock(`Checked ${checkedChannels}/${dmChannels.size} DMs... Deleted ${totalDeletedCount} messages so far...`));
             }
        }
        await editMessage.edit(CodeBlock(`Finished deleting. Total messages deleted: ${totalDeletedCount}`));

      } else {
        const targetUser = await ParseUsr(client, args[0], message);
         if (!targetUser || targetUser.id === message.author.id) {
             await message.reply(CodeBlock("Invalid user mention or ID provided."));
             return;
         }

        editMessage = await SendEditRep(message, `Deleting your messages in DM with ${targetUser.tag}...`);
        if (!editMessage) return;

         const dmChannel = client.channels.cache.find(
            ch => ch instanceof DMChannel && ch.recipient?.id === targetUser.id
         ) as DMChannel | undefined;

        if (dmChannel) {
          const messages = await FetchChMsg(dmChannel, 100);
          let deletedCount = 0;
          if (messages) {
            for (const msg of messages.values()) {
              if (msg.author.id === client.user?.id) {
                await SafeDelMsg(msg);
                deletedCount++;
                await delay(150); // Small delay
              }
            }
          }
          await editMessage.edit(CodeBlock(`Finished deleting. Deleted ${deletedCount} messages in DM with ${targetUser.tag}.`));
        } else {
          await editMessage.edit(CodeBlock(`Could not find an active DM channel with ${targetUser.tag} to delete messages from.`));
        }
      }
    } catch (error) {
      const errorMsg = "An error occurred while deleting DM messages.";
       if (editMessage) {
           try { await editMessage.edit(CodeBlock(errorMsg)); } catch {}
       }
      await HandleError(error, exports.default.name, message, errorMsg);
    }
  },
};