import { Client, Message } from "discord.js-selfbot-v13";
import fs from "fs";
import path from "path";
import { Logger } from "../../Utils/Logger";

interface LibraryEntry {
  LibID: number;
  Content: string;
  JumpBabyJump?: string;
}

const LibPath = path.join(__dirname, "../../Memory/library.json");

let library: LibraryEntry[] = [];
if (fs.existsSync(LibPath)) {
  try {
    library = JSON.parse(fs.readFileSync(LibPath, "utf-8"));
  } catch (error) {
    Logger.error(`Error reading library.json: ${(error as Error).message}`);
    library = [];
  }
}
let nextId =
  library.length > 0 ? Math.max(...library.map((e) => e.LibID)) + 1 : 1;

const SaveLib = () => {
  const dir = path.dirname(LibPath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LibPath, JSON.stringify(library, null, 2));
  } catch (error) {
    Logger.error(`Error saving library: ${(error as Error).message}`);
    throw error;
  }
};

export default {
  name: "library",
  description: "Manage a personal message library (like personal pins).",
  usage:
    "library [add <Message> | add (reply) | remove <id> | search <keyword> | (no args to list)]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
      if (!client.user) {
        await message.channel.send(
          "```\nClient is not fully initialized yet\n```",
        );
        return;
      }

      if (args.length === 0) {
        if (library.length === 0) {
          await message.channel.send("```\n📚 Your library is empty\n```");
          return;
        }
        const LibList = library
          .map((entry) => {
            const jump = entry.JumpBabyJump
              ? ` [Jump](${entry.JumpBabyJump})`
              : "";
            return `[${entry.LibID}]: ${entry.Content}${jump}`;
          })
          .join("\n");
        await message.channel.send(
          `\`\`\`\n📚 Your Library:\n${LibList}\n\`\`\``,
        );
        return;
      }

      if (args[0].toLowerCase() === "add") {
        if (args.length === 1) {
          if (message.reference && message.reference.messageId) {
            const RepliedMsg = await message.channel.messages.fetch(
              message.reference.messageId,
            );
            if (!RepliedMsg) {
              await message.reply(
                "```\nCould not fetch the replied message\n```",
              );
              return;
            }

            library.push({
              LibID: nextId++,
              Content: RepliedMsg.content,
              JumpBabyJump: RepliedMsg.url,
            });
            SaveLib();
            await message.reply(
              `\`\`\`\n✅ Added to library as ID ${nextId - 1}\n\`\`\``,
            );
          } else {
            await message.reply(
              "```\nUsage: !library add <Message> or reply to a message\n```",
            );
          }
          return;
        }

        const Content = args.slice(1).join(" ");
        library.push({
          LibID: nextId++,
          Content,
        });
        SaveLib();
        await message.reply(
          `\`\`\`\n✅ Added to library as ID ${nextId - 1}\n\`\`\``,
        );
        return;
      }

      if (args[0].toLowerCase() === "remove" && args.length === 2) {
        const Id2RM = parseInt(args[1]);
        const index = library.findIndex((entry) => entry.LibID === Id2RM);

        if (index === -1) {
          await message.reply("```\nLibrary entry with that ID not found\n```");
          return;
        }

        library.splice(index, 1);
        SaveLib();
        await message.reply(
          `\`\`\`\n✅ Removed library entry ID ${Id2RM}\n\`\`\``,
        );
        return;
      }

      if (args[0].toLowerCase() === "search" && args.length >= 2) {
        const keyword = args.slice(1).join(" ").toLowerCase();
        const matches = library.filter((entry) =>
          entry.Content.toLowerCase().includes(keyword),
        );

        if (matches.length === 0) {
          await message.reply("```\n🔍 No matches found in your library\n```");
          return;
        }

        const matchList = matches
          .map((entry) => {
            const jump = entry.JumpBabyJump
              ? ` [Jump](${entry.JumpBabyJump})`
              : "";
            return `[${entry.LibID}]: ${entry.Content}${jump}`;
          })
          .join("\n");

        await message.reply(`\`\`\`\n🔍 Search Results:\n${matchList}\n\`\`\``);
        return;
      }

      await message.reply(
        "```\nUsage: !library [add <Message> | add (reply) | remove <id> | search <keyword> | (no args to list)]\n```",
      );
    } catch (error) {
      Logger.error(`Error in library command: ${(error as Error).message}`);
      await message.reply("```\nAn error occurred\n```");
    }
  },
};
