import { AudioChunk } from "./AudioChunk";
import { AudioStream } from "./AudioStream";
import { AudioUtils } from "./AudioUtils";

enum RecordingStatus {
    Recording = "recording",
    Paused = "paused",
    Stopped = "stopped"
}

export class AudioRecorder {

    status: RecordingStatus = RecordingStatus.Stopped;
    chunks: AudioChunk[] = [];
    listeners: any[] = [];
    #onComplete?: (() => any)[] = [];

    constructor (private stream: AudioStream, private options: { destroyOnStop?: boolean } = {}) {
        this.setupListeners();
    }

    setupListeners () {
        this.listeners.push(
            this.stream.onData(this.#onData.bind(this))
        );
    }

    onData (cb: (chunk: AudioChunk) => any) {
        this.listeners.push(this.stream.onData(cb));
    }

    start () {
        this.status = RecordingStatus.Recording;
    }

    pause () {
        this.status = RecordingStatus.Paused;
    }

    stop () {
        this.status = RecordingStatus.Stopped;

        if (this.options.destroyOnStop) {
            this.stream.destroy();
        }
        this.stream.removeListeners(this.listeners);
        this.#onComplete?.forEach(cb => cb());
    }

    destroy () {
        this.stream.removeListeners(this.listeners);
    }

    wav () {
        return AudioUtils.pcmToWav(Buffer.concat(this.chunks.map(c => c.buf())));
    }

    flush () {
        this.chunks = [];
    }

    #onData (chunk: AudioChunk) {
        if (this.status === RecordingStatus.Recording) {
            this.chunks.push(chunk);
        }
    }

    onComplete (cb: () => any) {
        this.#onComplete?.push(cb);
    }

    static create (target: string) {
        return new AudioRecorder(AudioStream.create(target), {
            destroyOnStop: true
        });
    }

}