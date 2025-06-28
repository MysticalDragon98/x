import { ChromaClient } from "chromadb";
import { ChromaEmbeddingsStorage } from "./classes/ChromaEmbeddingsStorage";
import LogsFeature from "@features/logs";

export default class ChromaFeature {
    static #url: string
    static #client: ChromaClient;
    static #logger = LogsFeature.logger("@modules/chroma");

    static init (url: string) {
        this.#url = url;
        this.#client = new ChromaClient({ path: url });

        this.#logger.ok("Chroma module initialized");
    }

    static async collection (name: string) {
        return await this.#client.getOrCreateCollection({
            name
        });
    }

    static async storage (name: string) {
        return new ChromaEmbeddingsStorage(await this.collection(name));
    }
    
}