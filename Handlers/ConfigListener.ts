import chokidar from "chokidar";
import path from "path";
import { Logger } from "../Utils/Logger";

export const ConfigListener = (config: any) => {
  const configPath = path.join(__dirname, "../config/tokens.json");
  chokidar.watch(configPath).on("change", () => {
    delete require.cache[require.resolve(configPath)];
    Object.assign(config, require(configPath));
    Logger.log("Config reloaded!");
  });
};
