import { Queue, QueueOptions } from "./classes/queue";

export default class QueueFeature {
    
    static create<T> (options: QueueOptions) {
        return new Queue<T>(options);
    }

    static batch (array: any[], task: (item: any) => any, { batchSize = 10 }: { batchSize?: number } = {}) {
        return new Queue({ concurrentExecutions: batchSize }).all(array, task);
    }

}