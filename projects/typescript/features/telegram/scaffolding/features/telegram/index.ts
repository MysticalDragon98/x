import { Telegraf } from "telegraf";

export default class TelegramFeature {
    static client: Telegraf;

    static async init (apiKey: string) {
        TelegramFeature.client = new Telegraf(apiKey);

        await TelegramFeature.client.launch();
    }
}