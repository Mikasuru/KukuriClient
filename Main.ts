import { ClientInit } from "./Types/Client";
import { CheckToken } from "./Handlers/TokenChecker";
import { ConfigListener } from "./Handlers/ConfigListener";
import TokenConfig from "./config/tokens.json";
import { Logger } from "./Utils/Logger";
import { GetUpdates } from "./Utils/GitHubNews";

type TokenData = {
  prefix: string;
  token: string;
  allowUsers: string[] | "all";
  allowEveryone: boolean;
};

const tokens = Object.values(TokenConfig).map(
  (tokenData: TokenData) => tokenData.token,
);

if (tokens.length === 0) {
  Logger.error("No tokens found. Please add them in the tokens.json file.");
  process.exit(1);
}

CheckToken(tokens);

const bots: ClientInit[] = [];

for (const tokenData of Object.values(TokenConfig)) {
  const bot = new ClientInit(
    tokenData.prefix,
    tokenData.allowUsers,
    tokenData.allowEveryone,
  );
  bot.start(tokenData.token);
  bots.push(bot);
}

ConfigListener(TokenConfig);
GetUpdates();
