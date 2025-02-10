import ccxt from "ccxt";

export default new ccxt.binanceus({
    apiKey: process.env.BINANCE_KEY,
    Secret: process.env.BINANCE_SECRET,
});
