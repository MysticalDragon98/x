import { $throw } from "@/features/errors";
import { KeyValue } from "./KeyValue";
import { MemoryKV } from "./MemoryKV";
import { Schema } from "./Schema";
import { Store } from "./Store";
import { TableErrors } from "./Table";

export class MemoryStore extends Store<void>{
    
    constructor () {
        super();
    }
    
    _connect(): Promise<void> {
        return Promise.resolve();
    }

    table<T, ID>(name: string, schema: Schema<T, ID>): any {
        $throw(TableErrors.StorageTypeNotImplemented('table'));
    }

    keyValue<T, ID>(name: string, schema: Schema<T, ID>): KeyValue<T, ID> {
        return new MemoryKV<T, ID>({ name, schema, store: this });
    }


}

export const Memory = new MemoryStore();