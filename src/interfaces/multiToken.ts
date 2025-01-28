import { Config } from "@/modules/CommandHandler";

export interface TokenConfig {
    token: string;
    ownerId: string;
    prefix: string;
    allowedUsers?: string[];
}

export interface MultiTokenConfig extends Config {
    tokens: TokenConfig[];
}