import { PaperExchange, getPrice, getCandles } from "./exchange";
import { getRSI } from "../statistics";

export class Agent {
    holdings: number;
    ticker: string;
    rsi: number;
    exchange: PaperExchange;

    constructor(ticker: string = "BTC/USDT") {
        this.ticker = ticker;
        this.holdings = 0;
        this.rsi = 0;

        this.exchange = new PaperExchange(this.ticker);

        setInterval(async () => this.update(), 60 * 1000);
    }

    async update(): Promise<void> {
        const candles = await getCandles(this.ticker, "1m");

        if (candles) {
            console.log(`Fetched ${candles.length} candles for ${this.ticker}`);
            this.rsi = getRSI(candles);
        }
    }
}
