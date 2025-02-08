import axios from 'axios';
import { CryptoPrice } from '../types/types';

export class CryptoService {
    private static instance: CryptoService;
    private readonly baseUrl = 'https://api.coingecko.com/api/v3';
    private cache: Map<string, {data: any, timestamp: number}> = new Map();
    private readonly cacheDuration = 60000; // 1 minute

    private constructor() {}

    public static getInstance(): CryptoService {
        if (!CryptoService.instance) {
            CryptoService.instance = new CryptoService();
        }
        return CryptoService.instance;
    }

    private async fetchWithCache<T>(url: string): Promise<T> {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        const response = await axios.get<T>(`${this.baseUrl}${url}`);
        this.cache.set(url, {
            data: response.data,
            timestamp: Date.now()
        });
        
        return response.data;
    }

    public async getPrice(coinId: string): Promise<CryptoPrice> {
        const data = await this.fetchWithCache<Record<string, CryptoPrice>>(
            `/simple/price?ids=${coinId}&vs_currencies=usd,eur&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        );
        return data[coinId];
    }

    public async searchCoin(query: string): Promise<string[]> {
        const data = await this.fetchWithCache<any>(
            `/search?query=${query}`
        );
        return data.coins.map((coin: any) => coin.id);
    }
}