export class Objects {
    
    static map<I, O> (obj: Record<string, I>, fn: (value: I, key: string) => O): Record<string, O> {
        const result: Record<string, O> = {};

        for (const key in obj) {
            result[key] = fn(obj[key], key);
        }

        return result;
    }
}