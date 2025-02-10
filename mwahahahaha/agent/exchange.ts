import ccxt from "ccxt";

import { EngineCandle } from "../statistics";

const binance = new ccxt.binanceus({
    apiKey: process.env.BINANCE_KEY,
    secret: process.env.BINANCE_SECRET,
    enableRateLimit: true,
});

export async function getCandles(
    ticker: string = "BTC/USDT",
    interval: string = "5m",
    limit: number = 50,
): Promise<EngineCandle[] | undefined> {
    const candles = await binance.fetchOHLCV(ticker, interval, undefined, limit);

    // Format Data
    const formattedCandles = candles.map((c: any) => ({
        time: new Date(c[0]).toISOString(),
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5],
    }));

    return formattedCandles;
}

export async function getPrice(ticker: string = "BTC/USDT"): Promise<number | undefined> {
    try {
        const tickerInfo = await binance.fetchTicker(ticker);

        if (tickerInfo === undefined) return undefined;

        return tickerInfo.last;
    } catch (error) {
        console.error("Error fetching price:", error);
    }
}

export class Exchange {
    balance: number;
    holdings: number;

    async buy(amount: number): Promise<void> {}
    async sell(amount: number): Promise<void> {}
}

export class PaperExchange implements Exchange {
    balance: number = 100000;
    holdings: number = 0;
    transactionHistory: Array<{ type: string; amount: number; price: number }> = [];
    currentPrice: number = 0;
    ticker: string;

    constructor(ticker: string = "BTC/USDT") {
        this.ticker = ticker;

        setInterval(async () => {
            const price = await getPrice(this.ticker);
            if (price !== undefined) {
                this.updateCurrentPrice(price);
            }
        }, 60000);
    }

    updateCurrentPrice(price: number): void {
        this.currentPrice = price;
    }

    async buy(amount: number): Promise<void> {
        if (this.balance < amount * this.currentPrice) {
            console.error("Insufficient balance to buy.");
            return;
        }

        this.balance -= amount * this.currentPrice;
        this.holdings += amount;
        this.transactionHistory.push({ type: "buy", amount, price: this.currentPrice });
    }

    async sell(amount: number): Promise<void> {
        if (this.holdings < amount) {
            console.error("Insufficient holdings to sell.");
            return;
        }

        this.balance += amount * this.currentPrice;
        this.holdings -= amount;
        this.transactionHistory.push({ type: "sell", amount, price: this.currentPrice });
    }

    getTransactionHistory(): Array<{ type: string; amount: number; price: number }> {
        return this.transactionHistory;
    }
}
