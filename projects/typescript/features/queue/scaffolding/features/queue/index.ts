import { Queue, QueueOptions } from "./classes/queue";

export default class QueueFeature {
    
    create<T> (options: QueueOptions) {
        return new Queue<T>(options);
    }

}