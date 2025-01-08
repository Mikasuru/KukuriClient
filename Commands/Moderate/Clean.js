const { WebEmbed } = require('discord.js-selfbot-v13');
const notifier = require('node-notifier');

module.exports = {
    name: 'clean',
    description: 'Clean a specified number of messages',
    category: 'Moderate',
    aliases: ['clear', 'purge'],
    cooldown: 5,
    usage: '.clean [amount]',
    permissions: ['MANAGE_MESSAGES'],
    execute: async (message, args, client) => {
        if (!message.guild) {
            return message.channel.send('This command can only be used in a server.');
        }

        if (args.length !== 1 || isNaN(args[0])) {
            return message.channel.send('Please provide a valid number of messages to delete. Example: .clean 10');
        }

        const amount = parseInt(args[0]);
        if (amount <= 0 || amount > 101) {
            return message.channel.send('Please provide a number between 1 and 100.');
        }

        const confirmEmbed = new WebEmbed()
            .setColor('#FF0000')
            .setTitle('Confirm Message Deletion')
            .setDescription(`Are you sure you want to delete ${amount} messages?\nThis action cannot be undone.\nReply with "yes" to confirm or "no" to cancel.`);

        await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${confirmEmbed}` });

        try {
            const collected = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            if (collected.first().content.toLowerCase() === 'yes') {
                message.channel.send(`Deleting ${amount} messages...`);
                
                let deletedCount = 0;
                const messages = await message.channel.messages.fetch({ limit: amount + 1 });
                
                for (const msg of messages.values()) {
                    if (msg.deletable) {
                        await msg.delete();
                        deletedCount++;
                        await new Promise(resolve => setTimeout(resolve, 1000)); 
                    }
                }

                const resultEmbed = new WebEmbed()
                    .setColor('#00FF00')
                    .setTitle('Deletion Complete')
                    .setDescription(`Successfully deleted ${deletedCount} messages.\nSome messages may not have been deleted due to permissions or age restrictions.`);
                
                notifier.notify({
                        title: 'Kukuri Client',
                        message: `Successfully deleted ${deletedCount} messages.`,
                        sound: true,
                        wait: false
                    });

                await message.channel.send({ content: `${WebEmbed.hiddenEmbed}${resultEmbed}` });
            } else {
                message.channel.send('Operation cancelled.');
            }
        } catch (error) {
            console.error('Error in delete command:', error);
            message.channel.send('An error occurred while trying to delete messages.');
        }
    },
};