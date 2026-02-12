import { Environment } from "../env";
import LogsFeature from "../logs";
import { Schema } from "../storage/classes/Schema";
import { MongoStore } from "./classes/MongoStore";

const logger = LogsFeature.logger('@mongodb');
export default class MongoDbFeature {
    
    static #store: MongoStore = new MongoStore({ url: Environment.MongoUrl });

    static async init (url = Environment.MongoUrl) {
        await this.#store.connect();
        logger.ok(`Connected to MongoDB`);
    }

    static table<T, ID> (schema: Schema<T, ID>, name: string = schema.name) {
        return this.#store.table<T, ID>(name, schema);
    }

}