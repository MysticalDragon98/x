interface IndexOptions<T> {
    name: string;
    fields: Array<keyof T> | { [K in keyof T]: 'asc' | 'desc' };
    unique?: boolean;
}

export class Index<T> {
    
    readonly name: string;
    readonly fields: { [K in keyof Partial<T>]: 'asc' | 'desc' };
    readonly unique?: boolean;

    constructor (options: IndexOptions<T>) {
        const { name, fields, unique } = options;
        this.name = name;
        this.unique = unique ?? false;
        
        if (Array.isArray(fields)) {
            this.fields = Object.fromEntries(fields.map(field => [field, 'desc'])) as any;
        } else {
            this.fields = fields;
        }
    }

    equals (other: Index<T>) {
        if (this.name !== other.name) return false;
        if (this.unique !== other.unique) return false;

        for (const key in this.fields) {
            if (this.fields[key] !== other.fields[key]) return false;
        }

        for (const key in other.fields) {
            if (this.fields[key] !== other.fields[key]) return false;
        }

        return true;
    }
}