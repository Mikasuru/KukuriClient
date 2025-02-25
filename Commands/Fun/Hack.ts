import { Client, Message } from "discord.js-selfbot-v13";

export default {
  name: "hack",
  description: "Hacks a user.",
  usage: "hack [user]",
  execute: async (client: Client, message: Message, args: string[]) => {
    try {
        function delay(ms: number): Promise<void> {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        const user = message.mentions.users.first() || message.author;
        const msg = await message.channel.send('```🔍 Start hacking...```');

        await msg.edit('```Connecting to mainframe... [▓░░░░░░░░░] 10%```');
        await delay(1000);
        await msg.edit('```Accessing user data... [▓▓▓░░░░░░░] 30%```');
        await delay(1000);
        await msg.edit('```Downloading files... [▓▓▓▓▓░░░░░] 50%```');
        await delay(1000);
        await msg.edit('```Breaking encryption... [▓▓▓▓▓▓▓░░░] 70%```');
        await delay(1000);
        await msg.edit('```Completing process... [▓▓▓▓▓▓▓▓▓░] 90%```');
        await delay(1000);

        const passwd = [
            'iLovePizza123', 
            'password123',
            'qwerty12345',
            'letmein2024',
            'iAmHacker99'
        ];
        
        const email = `${user.username.toLowerCase()}${Math.floor(Math.random() * 999)}@email.com`;
        const uIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        const upwd = passwd[Math.floor(Math.random() * passwd.length)];

        const hkmsg = [
            '```ml',
            'HACK COMPLETE!',
            '===================================',
            `👤 "Hacked" User: ${user.tag}`,
            `📧 "Found" Email: ${email}`,
            `🔑 "Cracked" Password: ${upwd}`,
            `🌐 "IP Address": ${uIp}`,
            `📍 Location: Probably Earth 🌍`,
            '```'
        ].join('\n');

        await msg.edit(hkmsg);

    } catch (error) {
        console.error(`Error in hack command: ${(error as Error).message}`);
        await message.reply('```❌ Error running hack command```');
    }
  }
};
