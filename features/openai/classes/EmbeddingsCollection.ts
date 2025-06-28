import OpenAI from "openai";
import { EmbeddingsStorage } from "./EmbeddingsStorage";
import { EmbeddingsModel } from "../enums/EmbeddingsModel.enum";
import { Crypto } from "@features/crypto";
import OpenAIModule from "..";
import { Embeddings } from "./Embeddings";

export class EmbeddingsCollection {
    readonly #storage: EmbeddingsStorage;
    readonly #model: EmbeddingsModel;
    readonly #promiseCache: Map<string, Promise<Embeddings>> = new Map();

    constructor (model: EmbeddingsModel, storage: EmbeddingsStorage) {
        this.#storage = storage;
        this.#model = model;
    }

    async embeddings (input: string) {
        const hash = Crypto.sha256(input);

        if (this.#promiseCache.has(hash)) {
            return await this.#promiseCache.get(hash)!;
        }

        const cache = await this.#getCache(hash);
        if (cache) return cache;

        const promiseCache = OpenAIModule.embeddings(input, this.#model);
        this.#promiseCache.set(hash, promiseCache);

        try {
            const embeddings = await promiseCache;
            await this.#storage.add(embeddings);
            this.#promiseCache.delete(hash);

            return embeddings;
        } catch (exc: any) {
            this.#promiseCache.delete(hash);
            throw exc;
        }
    }

    async nearest (embeddings: number[], limit: number) {
        return await this.#storage.find(embeddings, limit);
    }

    async #getCache (hash: string) {
        return await this.#storage.get(hash);
    }
}