declare module "../config/config.json" {
    interface Config {
      prefix: string;
      allowUsers: string[];
    }
    const config: Config;
    export default config;
}