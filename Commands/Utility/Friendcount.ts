import { Client, Message } from "discord.js-selfbot-v13";

export default {
  name: "friendcount",
  description: "Get the total number of friends on Discord.",
  usage: "friendcount",
  execute: async (client: Client, message: Message, args: string[]) => {
    if (!client.user) {
      await message.reply("Client is not fully initialized yet.");
      return;
    }

    const Friends = client.relationships.friendCache;
    const FCount = Friends.size;

    const Msg = `
\`\`\`
Friend Information:
- Total Friends: ${FCount}
\`\`\`
        `;

    await message.reply(Msg);
  },
};
