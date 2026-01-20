import { KeyValue } from "./KeyValue";
import { Schema } from "./Schema";
import { Store } from "./Store";

export class MemoryKV<T, ID> extends KeyValue<T, ID> {

    private data: Map<any, T> = new Map();

    constructor ({ name, schema, store }: { name: string, schema: Schema<T, ID>, store: Store<any> }) {
        super({ name, schema, store });
    }

    async _get (key: any): Promise<T | null> {
        return this.data.get(key) ?? null;
    }

    async _exists (key: any): Promise<boolean> {
        return this.data.has(key);
    }

    async _set (key: any, value: T): Promise<void> {
        this.data.set(key, value);
    }

    async _setMany (entries: { key: any, value: T }[]): Promise<void> {
        for (const entry of entries) {
            this.data.set(entry.key, entry.value);
        }
    }

    async _delete (key: any): Promise<void> {
        this.data.delete(key);
    }

    async _list (): Promise<string[]> {
        return Array.from(this.data.keys());
    }

    async _clear (): Promise<void> {
        this.data.clear();
    }
}