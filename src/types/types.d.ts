export interface CryptoPrice {
    usd: number;
    eur: number;
    usd_24h_change: number;
    usd_market_cap: number;
    usd_24h_vol: number;
}

export interface WhaleTransaction {
    type: 'IN' | 'OUT';
    amount: string;
    valueUSD: string;
    timestamp: Date;
}

export interface PortfolioItem {
    coin: string;
    amount: number;
    buyPrice?: number;
    date?: Date;
}