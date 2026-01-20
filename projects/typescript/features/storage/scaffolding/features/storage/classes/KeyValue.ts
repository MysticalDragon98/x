import { $assert, CustomErrors } from "@/features/errors";
import { Schema } from "./Schema";
import { Store } from "./Store";
import LogsFeature from "@/features/logs";

const logger = LogsFeature.logger('@storage/key-value');

export const KeyValueErrors = CustomErrors({
    ItemNotFound: (name: string, key: string) => `Item with key '${key}' not found in key value '${name}'`,
})

export abstract class KeyValue<T, ID> {
    
    readonly name: string;
    readonly store: Store<any>;
    readonly schema: Schema<T, ID>;

    constructor ({ name, schema, store }: { name: string, schema: Schema<T, ID>, store: Store<any> }) {
        this.name = name;
        this.schema = schema;
        this.store = store;
    }

    abstract _get (key: ID): Promise<T | null>;
    abstract _set (key: ID, value: T): Promise<void>;
    abstract _setMany (entries: { key: ID, value: T }[]): Promise<void>;
    abstract _delete (key: ID): Promise<void>;
    abstract _list (): Promise<any[]>;
    abstract _clear (): Promise<void>;
    abstract _exists (key: ID): Promise<boolean>;


    async get (key: ID): Promise<T> {
        logger.debug(`Getting item with key ${key} in key value ${this.name}`);
        const result = await this._get(this.schema.serializeId(key));

        $assert(result, KeyValueErrors.ItemNotFound(this.name, key));

        return this.schema.deserialize(result!);
    }

    async set (key: ID, value: T) {
        logger.debug(`Setting item with key ${key} in key value ${this.name}`);
        this.schema.validate(value);

        await this._set(this.schema.serializeId(key), this.schema.serialize(value));
    }

    async setMany (entries: { key: ID, value: T }[]) {
        logger.debug(`Setting ${entries.length} items in key value ${this.name}`);

        const serializedEntries = entries.map(entry => ({
            key: this.schema.serializeId(entry.key),
            value: this.schema.serialize(entry.value)
        }));

        await this._setMany(serializedEntries);
    }
        

    async delete (key: ID) {
        logger.debug(`Deleting item with key ${key} in key value ${this.name}`);
        await this._delete(this.schema.serializeId(key));
    }

    async list () {
        logger.debug(`Listing items in key value ${this.name}`);
        const list = await this._list();

        return list.map(id => this.schema.deserializeId(id));
    }

    async clear () {
        logger.debug(`Clearing key value ${this.name}`);
        await this._clear();
    }

    async exists (key: ID) {
        logger.debug(`Checking if item with key ${key} exists in key value ${this.name}`);
        return await this._exists(this.schema.serializeId(key));
    }

}