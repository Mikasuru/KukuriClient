import chalk from "chalk";

export class Logger {
  static log(message: string) {
    console.log(chalk.green(`[INFO]: ${message}`));
  }

  static error(message: string) {
    console.error(chalk.red(`[ERROR]: ${message}`));
  }

  static warn(message: string) {
    console.warn(chalk.yellow(`[WARN]: ${message}`));
  }

  static news(type: string, message: string) {
    if (type === "header") {
      console.log(chalk.cyan.bold(`[KUKURI CLIENT]: ${message}`));
    } else {
      console.log(chalk.cyan(message));
    }
  }
}
