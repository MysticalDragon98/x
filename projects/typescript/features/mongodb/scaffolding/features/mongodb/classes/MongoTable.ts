import { $assert } from "@/features/errors";
import { Index } from "../../storage/classes/Index";
import { Schema } from "../../storage/classes/Schema";
import { Table, TableErrors } from "../../storage/classes/Table";
import { DotPath } from "../../storage/types/DotPath.type";
import { TableQuery } from "../../storage/types/TableQuery.type";
import { Objects } from "../../utils/classes/Objects";
import { MongoStore } from "./MongoStore";

export type MongoTableOptions<T, ID> = {
    store: MongoStore;
    name: string;
    schema: Schema<T, ID>;
}

export class MongoTable<T, ID> extends Table<T, ID> {
    
    #store: MongoStore;
    readonly name: string;
    readonly schema: Schema<T, ID>;

    constructor (options: MongoTableOptions<T, ID>) {
        super({
            store: options.store,
            name: options.name,
            schema: options.schema
        });

        this.#store = options.store;
        this.name = options.name;
        this.schema = options.schema;
    }

    protected async _init () {}
    protected async _listIndexes () {
        const collection = this.#store.collection(this.name);
        const indexes = await collection.indexes();
        
        return indexes.filter(index => !!index.name && index.name !== "_id_").map(index => new Index<T>({
            name: index.name!,
            unique: index.unique,
            fields: Objects.map(index.key, (value) => {
                return value === 1 ? 'asc' : 'desc';
            }) as any
        }))
    }

    protected async _dropIndex (name: string) {
        const collection = this.#store.collection(this.name);
        await collection.dropIndex(name);
    }

    protected async _createIndex (index: Index<T>) {
        const collection = this.#store.collection(this.name);

        await collection.createIndex(
            Objects.map(index.fields, (field: 'asc' | 'desc') => field === 'asc' ? 1 : -1),
            { unique: index.unique, name: index.name }
        );
    }

    protected async _create (data: T) {
        const collection = this.#store.collection(this.name);

        await collection.insertOne(data as T & { _id: never }).catch(exc => {
            $assert(exc.code !== 11000, TableErrors.ItemAlreadyExists(this.name, data[this.schema.id]));
            throw exc;
        });
    }

    protected async _get (id: any): Promise<T | null> {
        const collection = this.#store.collection(this.name);
        const result = await collection.findOne({ [this.schema.id]: id });

        return result as T;
    }

    protected async _getMany (ids: any[]): Promise<T[]> {
        const collection = this.#store.collection(this.name);
        const result = await collection.find({ [this.schema.id]: { $in: ids } }).toArray();

        return result as T[];
    }

    protected async _set (id: any, data: Partial<T>) {
        const collection = this.#store.collection(this.name);

        await collection.updateOne({ [this.schema.id]: id }, { $set: data });
    }

    protected async _update (id: any, data: Partial<T>) {
        const collection = this.#store.collection(this.name);

        await collection.updateOne({ [this.schema.id]: id }, { $set: data });
    }

    protected async _delete (id: any) {
        const collection = this.#store.collection(this.name);
        
        await collection.deleteOne({ [this.schema.id]: id });
    }

    protected async _deleteOne (query: TableQuery<T>) {
        const collection = this.#store.collection(this.name);

        const result = await collection.findOneAndDelete(this.parseQuery(query.filter));

        if (!result) return null;

        return (result as any)[this.schema.id] as ID;
    }

    protected async _deleteMany (query: TableQuery<T>) {
        const collection = this.#store.collection(this.name);
        const filter = this.parseQuery(query.filter);
        const itemsToDelete = await collection.find(filter, { projection: { [this.schema.id]: 1, _id: 1 } }).toArray();

        if (itemsToDelete.length === 0) return [];
        await collection.deleteMany({ _id: { $in: itemsToDelete.map(item => item._id) } });

        return itemsToDelete.map(item => (item as any)[this.schema.id] as ID);
    }

    protected async _findOne (query: TableQuery<T>) {
        const collection = this.#store.collection(this.name);
        const result = await collection.findOne(this.parseQuery(query.filter));

        return result as T;
    }

    protected async _findMany (query: TableQuery<T>) {
        const collection = this.#store.collection(this.name);
        const result = await collection.find(this.parseQuery(query.filter)).toArray();

        return result as T[];
    }

    protected async _updateOne (query: TableQuery<T>, data: Partial<T>) {
        const collection = this.#store.collection(this.name);
        const filter = this.parseQuery(query.filter);
        const itemToUpdate = await collection.findOne(filter, { projection: { [this.schema.id]: 1, _id: 1 } });
        if (!itemToUpdate) return null;

        await collection.updateOne({ _id: itemToUpdate._id }, { $set: data });

        return (itemToUpdate as any)[this.schema.id] as ID;
    }

    protected async _updateMany (query: TableQuery<T>, data: Partial<T>) {
        const collection = this.#store.collection(this.name);
        const filter = this.parseQuery(query.filter);
        const itemsToUpdate = await collection.find(filter, { projection: { [this.schema.id]: 1, _id: 1 } }).toArray();
        if (itemsToUpdate.length === 0) return [];

        await collection.updateMany({ _id: { $in: itemsToUpdate.map(item => item._id) } }, { $set: data });
        return itemsToUpdate.map(item => (item as any)[this.schema.id] as ID);
    }

    parseQuery (query?: Partial<T>) {
        return this.schema.serializePartial(query as any);
    }
}