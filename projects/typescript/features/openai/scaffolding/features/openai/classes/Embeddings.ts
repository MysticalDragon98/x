export class Embeddings {
    
    readonly embeddings: Array<number>;
    readonly id: string;
    readonly document: string;
    readonly metadata?: any;

    constructor (id: string, embeddings: Array<number>, document: string, metadata?: any) {
        this.id = id;
        this.embeddings = embeddings;
        this.document = document;
        this.metadata = metadata;
    }

}