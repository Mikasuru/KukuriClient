declare module "../config/config.json" {
    interface Config {
      prefix: string;
      allowUsers: string[];
      allowEveryone: boolean;
    }
    const config: Config;
    export default config;
}