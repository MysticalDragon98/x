export interface CrudCollection<T, ID> {

    //* Basic operations
    create (data: T): Promise<void>;
    read (id: ID): Promise<T | null>;
    update (id: ID, data: Partial<T>, options?: { upsert?: boolean }): Promise<void>;
    delete (id: ID): Promise<void>;

    //* Index operations
    createIndex (name: string, fields: { [key: string]: 'asc' | 'desc' }): Promise<void>;
    deleteIndex (name: string): Promise<void>;

    //* Query operations
    find (query: any, options?: { limit?: number, skip?: number }): Promise<T[]>;
    findOne (query: any): Promise<T | null>;
}