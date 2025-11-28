import { BehaviorSubject } from "rxjs";
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

    $state = new BehaviorSubject<VolumeBasedRecorderState>(this.state);

    constructor (private audioStream: AudioStream, options: VolumeBasedRecorderOptions = {}) {
        super(audioStream, { destroyOnStop: options.destroyOnStop });

        this.listeners.push(
            this.audioStream.onData(this.#onData.bind(this))
        );
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
            this.setState(VolumeBasedRecorderState.Recording);
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
            this.setState(VolumeBasedRecorderState.Completed);
            this.stop();
        }
    }

    waitForComplete () {
        return new Promise<void>((resolve, reject) => {
            this.onComplete(resolve);
        });
    }

    setState (state: VolumeBasedRecorderState) {
        this.state = state;
        this.$state.next(state);
    }

    static create (target: string, options: VolumeBasedRecorderOptions = {}) {
        return new VolumeBasedRecorder(AudioStream.create(target), {
            ...options,
            destroyOnStop: true
        });
    }

    static record (target: string, options: VolumeBasedRecorderOptions = {}) {
        return new Promise<Buffer>((resolve, reject) => {
            const rec = VolumeBasedRecorder.create(target, options);
            
            rec.onComplete(() => {
                resolve(rec.wav());
            });
        });
    }
}