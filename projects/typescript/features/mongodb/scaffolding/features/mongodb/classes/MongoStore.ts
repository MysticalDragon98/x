import { MongoClient } from "mongodb";
import { Store, StoreErrors } from "../../storage/classes/Store";
import { Schema } from "../../storage/classes/Schema";
import { MongoTable } from "./MongoTable";
import { $throw } from "@/features/errors";

export interface MongoConnectOptions {
    url: string;
}

export class MongoStore extends Store<MongoConnectOptions> {
    
    #client!: MongoClient;

    constructor (options: MongoConnectOptions) {
        super(options);
    }

    async _connect () {
        this.#client = new MongoClient(this.options.url);
    }

    collection (name: string) {
        return this.#client.db().collection(name);
    }

    table<T, ID> (name: string, schema: Schema<T, ID>) {
        const table = new MongoTable<T, ID>({
            store: this,
            name,
            schema
        });

        table.init();

        return table;
    }

    keyValue<T, ID>(name: string, schema: Schema<T, ID>): any {
        $throw(StoreErrors.StorageTypeNotImplemented('keyValue'));
    }

}