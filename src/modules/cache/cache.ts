export class Cache<T> {

    readonly #cache: Record<string, T> = {};
    
    get (key: string, callback: () => T): T {
        if (this.#cache[key] === undefined) {
            this.#cache[key] = callback();
        }

        return this.#cache[key];
    }
}