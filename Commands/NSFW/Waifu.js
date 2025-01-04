const axios = require('axios');
const { MessageAttachment } = require('discord.js-selfbot-v13');
const Config = require('../../Config/Config.json');

module.exports = {
    name: 'waifu',
    description: 'Send a waifu SFW/NSFW image',
    category: 'NSFW',
    async execute(message, args, client) {
        try {
            if (!message.channel.nsfw && Config.GeneralSettings.EnableNSFW == false) {
                message.delete();

                const response = await axios.get('https://api.waifu.pics/sfw/waifu');
                const imageUrl = response.data.url;

                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(imageResponse.data);
                
                const attachment = new MessageAttachment(buffer, 'image.gif');
                await message.channel.send({ files: [attachment] });

                const user = message.mentions.users.first();
                if (user) {
                    await message.channel.send(`${user} How cute is this waifu?`);
                }
                return message.channel.send('This command can only be used in NSFW channels!');
            }
            message.delete();

            const response = await axios.get('https://api.waifu.pics/nsfw/waifu');
            const imageUrl = response.data.url;

            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data);
            
            const attachment = new MessageAttachment(buffer, 'image.gif');
            await message.channel.send({ files: [attachment] });

            const user = message.mentions.users.first();
            if (user) {
                await message.channel.send(`${user} Look at this waifu...`);
            }

        } catch (error) {
            console.error('Error sending image:', error);
            await message.channel.send('Could not send image...');
        }
    },
};
