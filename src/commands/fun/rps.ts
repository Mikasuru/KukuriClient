import { Message, Client } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

const command: Command = {
    name: 'rps',
    description: 'Play Rock, Paper, Scissors',
    category: 'Fun',
    aliases: ['rockpaperscissors'],
    usage: '.rps [rock/paper/scissors]\nExample: .rps rock',
    cooldown: 3,
    
    async execute(message: Message, args: string[], client: Client): Promise<void> {
        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = args[0]?.toLowerCase();
        
        if (!choices.includes(userChoice)) {
            await message.channel.send('Please choose rock, paper, or scissors!');
            return;
        }

        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result;

        if (userChoice === botChoice) {
            result = 'It\'s a tie!';
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'You win!';
        } else {
            result = 'You lose!';
        }

        await message.channel.send(
            `✂️ Your choice: ${userChoice}\n` +
            `My choice: ${botChoice}\n` +
            `Result: ${result}`
        );
    }
};

export default command;