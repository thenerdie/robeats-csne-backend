import { RSI } from "technicalindicators";

export interface EngineCandle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export function getRSI(candles: EngineCandle[]): number {
    const closePrices = candles.map((c: any) => c.close);
    const rsiValues = RSI.calculate({ values: closePrices, period: 14 });

    const latestRSI = rsiValues[rsiValues.length - 1];

    return latestRSI;
}
