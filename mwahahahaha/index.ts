import dotenv from "dotenv";
dotenv.config();

import binance from "./agent/binance";

async function update() {}

async function main() {
    setInterval(update, 300000);

    update();
}

main();
