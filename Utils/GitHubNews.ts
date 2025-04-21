import axios from "axios";
import chalk from "chalk";
import { Logger } from "./Logger";

async function GetUpdates() {
  const URL = `https://raw.githubusercontent.com/Mikasuru/KukuriClient/refs/heads/News/news`;
  try {
    const Res = await axios.get(URL);
    const Content = Res.data as string;
    Parse(Content);
  } catch (error) {
    Logger.error(`Failed to fetch bot updates`);
  }
}

function Parse(content: string) {
  const Lines = content.split("\n").filter((line) => line.trim() !== "");
  let CurrDate = "";
  let News: string[] = [];

  for (const line of Lines) {
    if (line.startsWith("[ Date ]")) {
      if (CurrDate && News.length > 0) {
        Display(CurrDate, News);
        News = [];
      }
      CurrDate = Lines[Lines.indexOf(line) + 1]?.trim() || "";
    } else if (line.startsWith("[ News ]")) {
      continue;
    } else if (CurrDate) {
      News.push(line.trim());
    }
  }

  if (CurrDate && News.length > 0) {
    Display(CurrDate, News);
  }
}

function Display(date: string, news: string[]) {
  console.log(chalk.magenta.bold("---------- [ Getting News ] ----------"));
  Logger.news("header", `Update on ${date}:`);
  news.forEach((item) => Logger.news("", `- ${item}`));
  console.log(chalk.magenta.bold("------------ [ Starting ] ------------"));
}

export { GetUpdates };
