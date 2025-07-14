export interface QueueOptions {
    concurrentExecutions: number;
    delay?: number; // in ms, optional delay between tasks
}

type Task<T> = () => Promise<T>;

export class Queue<T> {
    private queue: Array<{
        task: Task<any>;
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    private running = 0;
    private readonly maxConcurrency: number;
    private readonly delay: number;

    constructor(options: QueueOptions) {
        this.maxConcurrency = options.concurrentExecutions;
        this.delay = options.delay ?? 0;
    }

    async add(task: Task<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.runNext();
        });
    }

    async all<X> (array: X[], task: (item: any) => any) {
        return await Promise.all(array.map(item => this.add(async () => await task(item))));
    }
    
    private async runNext() {
        if (this.running >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const { task, resolve, reject } = this.queue.shift()!;
        this.running++;

        try {
            const result = await task();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            this.running--;
            if (this.delay > 0) {
                setTimeout(() => this.runNext(), this.delay);
            } else {
                this.runNext();
            }
        }

        // Trigger more executions if possible (concurrent)
        this.runNext();
    }
}
