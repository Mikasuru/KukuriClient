import {
  Client,
  Message,
  TextChannel,
  DMChannel,
} from "discord.js-selfbot-v13";
import { Logger } from "../../Utils/Logger";

export default {
  name: "deleteinvite",
  description:
    "Delete messages containing Discord invite links sent within the last 7 days across all servers and DMs.",
  usage: "deleteinvite",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!client.user) {
        await message.reply("```\nClient is not fully initialized yet\n```");
        return;
      }

      const StatusMsg = await message.reply(
        "```\n🔍 Checking for invite links across all servers and DMs...\n```",
      );

      const LastSeven = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const InvRegex = /(discord\.gg\/[a-zA-Z0-9]+|https?:\/\/[^\s]+)/i;
      let TolDeleted = 0;

      const guilds = client.guilds.cache;
      for (const [guildId, guild] of guilds) {
        const textChannels = guild.channels.cache.filter(
          (ch) => ch instanceof TextChannel,
        );
        for (const [channelId, channel] of textChannels) {
          try {
            const messages = await (channel as TextChannel).messages.fetch({
              limit: 100,
            });
            const ClientMsg = messages.filter(
              (msg) =>
                msg.author.id === client.user.id &&
                InvRegex.test(msg.content) &&
                msg.createdTimestamp > LastSeven,
            );

            for (const [id, msg] of ClientMsg) {
              try {
                await msg.delete();
                TolDeleted++;
              } catch (error) {
                Logger.error(
                  `Failed to delete message ${id} in channel ${channelId} (guild ${guildId}): ${(error as Error).message}`,
                );
              }
            }
          } catch (error) {
            Logger.error(
              `Error fetching messages in channel ${channelId} (guild ${guildId}): ${(error as Error).message}`,
            );
          }
        }
      }

      const dmChannels = client.channels.cache.filter(
        (ch) => ch instanceof DMChannel,
      );
      for (const [channelId, channel] of dmChannels) {
        try {
          const messages = await (channel as DMChannel).messages.fetch({
            limit: 100,
          });
          const ClientMsg = messages.filter(
            (msg) =>
              msg.author.id === client.user.id &&
              InvRegex.test(msg.content) &&
              msg.createdTimestamp > LastSeven,
          );

          for (const [id, msg] of ClientMsg) {
            try {
              await msg.delete();
              TolDeleted++;
            } catch (error) {
              console.error(
                `Failed to delete message ${id} in DM ${channelId}: ${(error as Error).message}`,
              );
            }
          }
        } catch (error) {
          console.error(
            `Error fetching messages in DM ${channelId}: ${(error as Error).message}`,
          );
        }
      }

      if (TolDeleted === 0) {
        await StatusMsg.edit(
          "```\n✅ No invite links found within the last 7 days across all servers and DMs\n```",
        );
      } else {
        await StatusMsg.edit(
          `\`\`\`\n✅ Deleted ${TolDeleted} message(s) containing invite links across all servers and DMs\n\`\`\``,
        );
        Logger.log(
          `✅ Deleted ${TolDeleted} message(s) containing invite links across all servers and DMs`,
        );
      }
    } catch (error) {
      Logger.error(
        `Error in deleteinvite command: ${(error as Error).message}`,
      );
      await message.reply("```\nAn error occurred while checking invites\n```");
    }
  },
};
