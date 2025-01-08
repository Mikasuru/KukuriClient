const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'trivia',
    description: 'Send a random trivia question',
    category: 'Fun',
    aliases: ['question', 'quiz'],
    cooldown: 5,
    usage: '.trivia',
    permissions: ['SEND_MESSAGES'],
    execute(message, args) {
        const messageData = JSON.parse(
            readFileSync(path.join(__dirname, '../../data/Message.json'))
        );

        const questions = messageData.Trivia.Message;
        const question = questions[Math.floor(Math.random() * questions.length)];
        message.channel.send(question);
    },
};
