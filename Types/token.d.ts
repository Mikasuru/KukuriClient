declare module "../config/tokens.json" {
  interface TokenConfig {
    prefix: string;
    token: string;
    allowUsers: string[] | "all";
    // allowEveryone: boolean; // Removed
  }

  const tokensConfig: Record<string, TokenConfig>;
  export default tokensConfig;
}