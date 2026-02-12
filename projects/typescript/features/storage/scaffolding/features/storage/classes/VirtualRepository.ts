import { Table } from "./Table";
import { Schema } from "./Schema";
import { $assert, CustomErrors } from "@/features/errors";
import { KeyValue } from "./KeyValue";
import { TableQuery } from "../types/TableQuery.type";
import { Memory } from "./MemoryStore";
import MongoDbFeature from "@/features/mongodb";

export const VirtualRepositoryErrors = CustomErrors({
    TableSchemasNotEqual: (table: string, keyValue: string) => `Table and key value schemas must be the same for virtual repository '${table}' and '${keyValue}'`
})

export interface VirtualRepositoryOptions<T, ID> {
    table: Table<T, ID>;
    kv: KeyValue<T, ID>;
}

export class VirtualRepository<T, ID> {

    readonly table: Table<T, ID>;
    readonly kv: KeyValue<T, ID>;
    readonly schema: Schema<T, ID>;

    constructor (options: VirtualRepositoryOptions<T, ID>) {
        this.table = options.table;
        this.kv = options.kv;

        $assert(this.table.schema === this.kv.schema, VirtualRepositoryErrors.TableSchemasNotEqual(this.table.name, this.kv.name));
        this.schema = options.table.schema;
    }

    async init () {
        await this.table.init();
    }

    destroy () {}

    async onSet (item: T) {
        await this.kv.set(this.schema.itemId(item), item);
    }

    async onDelete (id: ID) {
        await this.kv.delete(id);
    }

    async onUpdate (id: ID) {
        const item = await this.table.get(id);
        await this.kv.set(id, item);
    }

    async onUpdateMany (ids: ID[]) {
        const items = await this.table.getMany(ids);

        await this.kv.setMany(items.map(item => ({ key: this.schema.itemId(item), value: item })));
    }

    async get (id: ID) {
        try {
            return await this.kv.get(id);
        } catch (error: any) {
            if (error.code !== "ItemNotFound") throw error;

            const result = await this.table.get(id);
            this.kv.set(id, result);
            return result;
        }
    }

    async set (id: ID, item: T) {
        await this.table.set(id, item);
        await this.onSet(item);
    }

    async create (item: T) {
        const result = await this.table.create(item);

        await this.onSet(item);

        return result;
    }

    async delete (id: ID) {
        await this.table.delete(id);
        await this.onDelete(id);
    }

    async update (id: ID, item: Partial<T>) {
        await this.table.update(id, item);
        await this.onUpdate(id);
    }

    async updateOne (query: TableQuery<T>, item: T) {
        await this.table.updateOne(query, item);
        await this.onUpdate(this.schema.itemId(item));
    }

    async updateMany (query: TableQuery<T>, item: T) {
        await this.table.updateMany(query, item);
        await this.onUpdateMany((await this.table.find(query)).map(i => this.schema.itemId(i)));
    }

    async getMany (ids: ID[]) {
        return await this.table.getMany(ids);
    }

    async find (query: TableQuery<T>) {
        return await this.table.find(query);
    }

    async findOne (query: TableQuery<T>) {
        return await this.table.findOne(query);
    }

    async deleteOne (query: TableQuery<T>) {
        const item = await this.table.deleteOne(query);
        if (item) await this.onDelete(item);
    }

    async deleteMany (query: TableQuery<T>) {
        const ids = await this.table.deleteMany(query);

        await this.onUpdateMany(ids);
    }

}