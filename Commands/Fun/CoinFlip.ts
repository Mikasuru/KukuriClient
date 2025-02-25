import { Client, Message } from "discord.js-selfbot-v13";

export default {
  name: "coinflip",
  description: "Flips a coin.",
  usage: "coinflip",
  execute: (client: Client, message: Message, args: string[]) => {
    function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }
    const coin = ["Heads", "Tails"];
    const result = coin[getRandomInt(coin.length)];
    message.reply(`You flipped a coin and got **${result}**!`);
  }
};
