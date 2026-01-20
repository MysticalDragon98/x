import { CustomErrors } from "@/features/errors";
import { KeyValue } from "./KeyValue";
import { Schema } from "./Schema";
import { Table } from "./Table";

export const StoreErrors = CustomErrors({
    StorageTypeNotImplemented: (name: string) => `Storage type '${name}' not implemented`
})

export abstract class Store<ConnectOptions> {

    protected _connectionPromise?: Promise<void>
    
    protected connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
    protected options: ConnectOptions;

    abstract _connect (): Promise<void>;
    abstract table<T, ID> (name: string, schema: Schema<T, ID>): Table<T, ID>;
    abstract keyValue<T, ID> (name: string, schema: Schema<T, ID>): KeyValue<T, ID>;

    constructor (options: ConnectOptions) {
        this.options = options;
    }

    async connect () {
        if (this._connectionPromise) return await this._connectionPromise;

        this._connectionPromise = this._connect();
        this.connectionStatus = 'connecting';
        await this._connectionPromise;

        this.connectionStatus = 'connected';
    }
}