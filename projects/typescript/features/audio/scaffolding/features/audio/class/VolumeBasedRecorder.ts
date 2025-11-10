import { AudioChunk } from "./AudioChunk";
import { AudioRecorder } from "./AudioRecorder";
import { AudioStream } from "./AudioStream";

export interface VolumeBasedRecorderOptions {
    destroyOnStop?: boolean;
    silenceThreshold?: number;
    maxConsecutiveSilences?: number;
}

export enum VolumeBasedRecorderState {
    NotStarted = "not-started",
    Recording = "recording",
    Completed = "completed"
}

export class VolumeBasedRecorder extends AudioRecorder {

    state: VolumeBasedRecorderState = VolumeBasedRecorderState.NotStarted;

    silenceThreshold: number;
    maxConsecutiveSilences: number;
    silencesCount: number = 0;

    protected constructor (private recorder: AudioStream, options: VolumeBasedRecorderOptions = {}) {
        super(recorder, { destroyOnStop: options.destroyOnStop });

        this.recorder.onData(this.#onData.bind(this));
        this.silenceThreshold = options.silenceThreshold || -10;
        this.maxConsecutiveSilences = options.maxConsecutiveSilences || 30;
    }

    #onData (chunk: AudioChunk) {
        switch (this.state) {
            case VolumeBasedRecorderState.NotStarted:
                this.#onNotStartedData(chunk);
                break;
            case VolumeBasedRecorderState.Recording:
                this.#onRecordingData(chunk);
                break;
            case VolumeBasedRecorderState.Completed:
                break;
        }
    }

    #onNotStartedData (chunk: AudioChunk) {
        if (chunk.volume() > this.silenceThreshold) {
            this.state = VolumeBasedRecorderState.Recording;
            this.start();
        }
    }

    #onRecordingData (chunk: AudioChunk) {
        if (chunk.volume() < this.silenceThreshold) {
            this.silencesCount++;
        } else {
            this.silencesCount = 0;
        }

        if (this.silencesCount >= this.maxConsecutiveSilences) {
            this.state = VolumeBasedRecorderState.Completed;
            this.stop();
        }
    }

    static create (target: string) {
        return new VolumeBasedRecorder(AudioStream.create(target), {
            destroyOnStop: true
        });
    }

    static record (target: string) {
        return new Promise<Buffer>((resolve, reject) => {
            const rec = VolumeBasedRecorder.create(target);
            
            rec.onComplete(() => {
                resolve(rec.wav());
            });
        });
    }
}