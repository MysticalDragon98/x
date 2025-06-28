import { Embeddings } from "./Embeddings";
import { RelativeEmbeddings } from "./RelativeEmbeddings";

export abstract class EmbeddingsStorage {
    abstract add (options: Embeddings): Promise<void>;
    abstract get (id: string): Promise<Embeddings | null>;
    abstract find (embeddings: number[], limit: number): Promise<RelativeEmbeddings[]>;
}