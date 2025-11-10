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
    #onComplete?: (() => any)[] = [];

    protected constructor (private stream: AudioStream, private options: { destroyOnStop?: boolean } = {}) {
        this.setupListeners();
    }

    setupListeners () {
        this.stream.onData(this.#onData.bind(this));
    }

    onData (cb: (chunk: AudioChunk) => any) {
        this.stream.onData(cb);
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

        this.#onComplete?.forEach(cb => cb());
    }

    wav () {
        return AudioUtils.pcmToWav(Buffer.concat(this.chunks.map(c => c.buf())));
    }

    flush () {
        this.chunks = [];
    }

    #onData (chunk: AudioChunk) {
        console.log(this.status, this.chunks.length);
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