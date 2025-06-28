import { Embeddings } from "./Embeddings";

export class RelativeEmbeddings extends Embeddings{

    readonly distance: number;
    
    constructor (id: string, embeddings: Array<number>, document: string, distance: number) {
        super(id, embeddings, document);
        this.distance = distance;
    }
}