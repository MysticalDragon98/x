import LogsFeature from "@/features/logs";
import { TableQuery } from "../types/TableQuery.type";
import { Index } from "./Index";
import { Schema } from "./Schema";
import { Store } from "./Store";
import { $assert, CustomErrors } from "@/features/errors";
import { FieldType } from "./FieldType";
import { AsyncNotifier } from "../../async/classes/AsyncNotifier";

const logger = LogsFeature.logger('@storage/table');
export const TableErrors = CustomErrors({
    ItemNotFound: (table: string, id: any) => `Item with id '${id}' not found in table '${table}'`,
    ItemAlreadyExists: (table: string, id: any) => `Item with id '${id}' already exists in table '${table}'`
})

export abstract class Table<T, ID> {

    readonly store: Store<any>;
    readonly name: string;
    readonly schema: Schema<T, ID>;
    
    readonly $create: AsyncNotifier<T> = new AsyncNotifier();
    readonly $set: AsyncNotifier<T> = new AsyncNotifier();
    readonly $update: AsyncNotifier<ID> = new AsyncNotifier();
    readonly $delete: AsyncNotifier<ID> = new AsyncNotifier();
    readonly $deleteOne: AsyncNotifier<ID> = new AsyncNotifier();
    readonly $deleteMany: AsyncNotifier<ID[]> = new AsyncNotifier();
    readonly $updateOne: AsyncNotifier<ID> = new AsyncNotifier();
    readonly $updateMany: AsyncNotifier<ID[]> = new AsyncNotifier();

    constructor ({ name, schema, store }: { name: string, schema: Schema<T, ID>, store: Store<any> }) {
        this.name = name;
        this.schema = schema;
        this.store = store;
    }

    protected abstract _init (): Promise<void>;
    protected abstract _createIndex (index: Index<T>): Promise<void>;
    protected abstract _listIndexes (): Promise<Index<T>[]>;
    protected abstract _dropIndex (name: string): Promise<void>;
    
    protected abstract _create (data: T): Promise<void>;
    protected abstract _get (id: ID): Promise<T | null>;
    protected abstract _set (id: ID, data: Partial<T>): Promise<void>;
    protected abstract _update (id: ID, data: Partial<T>): Promise<void>;
    protected abstract _delete (id: ID): Promise<void>;
    protected abstract _getMany (ids: ID[]): Promise<T[]>;

    protected abstract _findOne (query: TableQuery<T>): Promise<T | null>;
    protected abstract _findMany (query: TableQuery<T>): Promise<T[]>;
    protected abstract _deleteMany (query: TableQuery<T>): Promise<ID[]>;
    protected abstract _deleteOne (query: TableQuery<T>): Promise<ID | null>;
    protected abstract _updateOne (query: TableQuery<T>, data: Partial<T>): Promise<ID | null>;
    protected abstract _updateMany (query: TableQuery<T>, data: Partial<T>): Promise<ID[]>;

    async init () {
        logger.debug(`Initializing table ${this.name}`);
        await this.store.connect()
        await this.ensureIndexes();
    }

    async ensureIndexes () {
        logger.debug(`Ensuring indexes for table ${this.name}`);
        const indexes = await this._listIndexes();
        const dbIndexes = new Map(indexes.map(index => [index.name, index]));
        const existingIndexes = new Map(this.schema.indexes.map(index => [index.name, index]));
        
        await Promise.all(indexes.map(async index => {
            if (!existingIndexes.get(index.name)?.equals(index)) {
                logger.debug(`Dropping outdated index "${index.name}" for table "${this.name}"`);
                await this._dropIndex(index.name);
                dbIndexes.delete(index.name);
            }
        }));

        await Promise.all(this.schema.indexes.map(async index => {
            if (!dbIndexes.has(index.name)){
                logger.debug(`Creating index ${index.name} for table ${this.name}`);
                await this._createIndex(index);
            }
        }));

        logger.debug(`Ensured indexes for table ${this.name}`);
    }

    async create (data: T) {
        logger.debug(`Creating item in table ${this.name}`);

        const object = this.schema.serialize(data);
        await this._create(object);

        await this.$create.notifyAndWait(data);
        return data;
    }

    async get (id: ID): Promise<T> {
        logger.debug(`Reading item with id ${id} in table ${this.name}`);
        this.idFieldType().validate(id);
        const result = await this._get(this.idFieldType().serialize(id));

        $assert(result, TableErrors.ItemNotFound(this.name, id));

        const deserializedResult = this.schema.deserialize(result!);

        return deserializedResult;
    }

    async set (id: ID, data: T) {
        logger.debug(`Updating item with id ${id} in table ${this.name}`);

        this.idFieldType().validate(id);
        await this._set(this.idFieldType().serialize(id), this.schema.serialize(data));

        await this.$set.notifyAndWait(data);
    }

    async update (id: ID, data: Partial<T>) {
        logger.debug(`Updating item with id ${id} in table ${this.name}`);

        this.idFieldType().validate(id);
        await this._update(this.idFieldType().serialize(id), this.schema.serializePartial(data));

        await this.$update.notifyAndWait(id);
    }

    async delete (id: ID) {
        logger.debug(`Deleting item with id ${id} in table ${this.name}`);
        this.idFieldType().validate(id);
        await this._delete(this.idFieldType().serialize(id));

        await this.$delete.notifyAndWait(id);
    }

    async deleteOne (query: TableQuery<T>) {
        logger.debug(`Deleting one item in table ${this.name}`);
        
        const result = await this._deleteOne(query);
        if (!result) return;

        await this.$deleteOne.notifyAndWait(result);
    }

    async deleteMany (query: TableQuery<T>) {
        logger.debug(`Deleting many items in table ${this.name}`);
        const deletedItems = await this._deleteMany(query);

        await this.$deleteMany.notifyAndWait(deletedItems);
    }

    async find (query: TableQuery<T>) {
        logger.debug(`Finding items in table ${this.name}`);
        const results = await this._findMany(query);

        return results.map(result => this.schema.deserialize(result));
    }

    async findOne (query: TableQuery<T>) {
        logger.debug(`Finding one item in table ${this.name}`);
        const result = await this._findOne(query);

        return result? this.schema.deserialize(result) : null;
    }

    async updateOne (query: TableQuery<T>, data: Partial<T>) {
        logger.debug(`Updating one item in table ${this.name}`);
        const updatedItem = await this._updateOne(query as any, data);
        if (!updatedItem) return;

        await this.$updateOne.notifyAndWait(updatedItem);
    }

    async updateMany (query: TableQuery<T>, data: Partial<T>) {
        logger.debug(`Updating many items in table ${this.name}`);
        const updatedItems = await this._updateMany(query, data);

        await this.$updateMany.notifyAndWait(updatedItems.map(item => this.schema.deserializeId(item) as ID));
    }

    async getMany (ids: ID[]) {
        logger.debug(`Getting ${ids.length} items in table ${this.name}`);
        const items = await this._getMany(ids.map(id => this.idFieldType().serialize(id)));

        return items.map(item => this.schema.deserialize(item));
    }

    idFieldType () {
        return this.schema.fields[this.schema.id].type as FieldType<ID>;
    }

}