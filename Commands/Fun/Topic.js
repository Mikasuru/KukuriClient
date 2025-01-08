const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'topic',
    description: 'Send a conversation topic',
    category: 'Fun',
    aliases: ['randomtopic', 'discuss'],
    cooldown: 5,
    usage: '.topic',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const topics = messageData.Topic.Message;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        message.channel.send(topic);
    },
};
