import { Table } from "./Table";
import { Schema } from "./Schema";
import { $assert, CustomErrors } from "@/features/errors";
import { KeyValue } from "./KeyValue";
import { AsyncSubscription } from "../../async/classes/AsyncSubscription";
import { TableQuery } from "../types/TableQuery.type";

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
    readonly listeners: AsyncSubscription<any>[] = [];
    readonly schema: Schema<T, ID>;

    constructor (options: VirtualRepositoryOptions<T, ID>) {
        this.table = options.table;
        this.kv = options.kv;

        $assert(this.table.schema === this.kv.schema, VirtualRepositoryErrors.TableSchemasNotEqual(this.table.name, this.kv.name));
        this.schema = options.table.schema;
    }

    init () {
        this.listeners.push(
            this.table.$create.subscribe(item => this.onSet(item)),
            this.table.$delete.subscribe(id => this.onDelete(id)),
            this.table.$set.subscribe(item => this.onSet(item)),
            this.table.$update.subscribe(id => this.onUpdate(id)),
            this.table.$updateOne.subscribe(id => this.onUpdate(id)),
            this.table.$updateMany.subscribe(ids => this.onUpdateMany(ids))
        )
    }

    destroy () {
        this.listeners.forEach(listener => listener.unsubscribe());
    }

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
    }

    async create (item: T) {
        return await this.table.create(item);
    }

    async delete (id: ID) {
        await this.table.delete(id);
    }

    async update (id: ID, item: T) {
        await this.table.update(id, item);
    }

    async updateOne (query: TableQuery<T>, item: T) {
        await this.table.updateOne(query, item);
    }

    async updateMany (query: TableQuery<T>, item: T) {
        await this.table.updateMany(query, item);
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
        await this.table.deleteOne(query);
    }

    async deleteMany (query: TableQuery<T>) {
        await this.table.deleteMany(query);
    }
}