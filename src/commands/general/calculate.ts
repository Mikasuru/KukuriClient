import { Message, Client, WebEmbed } from 'discord.js-selfbot-v13';
import { Command } from '../../interfaces';

type Operation = 'Addition' | 'Subtraction' | 'Multiplication' | 'Division';

interface CalculationResult {
    operation: Operation;
    result: number;
    valid: boolean;
    error?: string;
}

const command: Command = {
    name: 'cal',
    description: 'Perform basic mathematical calculations',
    category: 'General',
    aliases: ['calc', 'math'],
    cooldown: 3,
    usage: '.cal [number] [operator] [number]\nExample: .cal 5 + 3',

    async execute(message: Message, args: string[], client: Client): Promise<Message> {
        if (args.length < 3) {
            return message.channel.send('Usage: .cal [number] [operator] [number]');
        }

        const num1 = Number(args[0]);
        const operator = args[1];
        const num2 = Number(args[2]);

        if (isNaN(num1) || isNaN(num2)) {
            return message.channel.send('Please provide valid numbers');
        }

        const result = calculateResult(num1, operator, num2);

        if (!result.valid) {
            return message.channel.send(result.error || 'Invalid calculation');
        }

        const embed = new WebEmbed()
            .setColor('#0099ff')
            .setTitle('Calculation Result')
            .setDescription(
                `Operation: ${result.operation}\n` +
                `Expression: ${num1} ${operator} ${num2}\n` +
                `Result: ${result.result}`
            );

        return message.channel.send({
            content: `${WebEmbed.hiddenEmbed}${embed}`
        });
    }
};

function calculateResult(num1: number, operator: string, num2: number): CalculationResult {
    switch (operator) {
        case '+':
            return {
                operation: 'Addition',
                result: num1 + num2,
                valid: true
            };
        case '-':
            return {
                operation: 'Subtraction',
                result: num1 - num2,
                valid: true
            };
        case '*':
            return {
                operation: 'Multiplication',
                result: num1 * num2,
                valid: true
            };
        case '/':
            if (num2 === 0) {
                return {
                    operation: 'Division',
                    result: 0,
                    valid: false,
                    error: 'Cannot divide by zero!'
                };
            }
            return {
                operation: 'Division',
                result: num1 / num2,
                valid: true
            };
        default:
            return {
                operation: 'Addition',
                result: 0,
                valid: false,
                error: 'Please use these operators: +, -, *, /'
            };
    }
}

export default command;