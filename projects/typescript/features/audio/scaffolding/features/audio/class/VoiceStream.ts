import { Readable, Transform } from "stream";
import { AudioChunk } from "./AudioChunk";
import { AudioStream } from "./AudioStream";
import { VolumeBasedRecorder, VolumeBasedRecorderState } from "./VolumeBasedRecorder";
import { BehaviorSubject, Subscription } from "rxjs";

export enum VoiceStreamState {
    Idle = "idle",
    Recording = "recording"
}

export interface VoiceStreamOptions {
    silenceThreshold?: number;
    maxConsecutiveSilences?: number;   
}

export class VoiceStream {

    silenceThreshold: number;
    maxConsecutiveSilences: number;
    chunks: AudioChunk[] = [];
    recorder?: VolumeBasedRecorder;
    running: boolean = false;
    stream: Readable;

    $state = new BehaviorSubject<VoiceStreamState>(VoiceStreamState.Idle);

    constructor (private audioStream: AudioStream, options: VoiceStreamOptions) {
        this.silenceThreshold = options.silenceThreshold || -10;
        this.maxConsecutiveSilences = options.maxConsecutiveSilences || 30;
        this.stream = new Readable({
            read () {}
        });
    }

    async start () {
        this.running = true;
        while (this.running) {
            this.recorder = new VolumeBasedRecorder(this.audioStream, {
                silenceThreshold: this.silenceThreshold,
                maxConsecutiveSilences: this.maxConsecutiveSilences
            });

            const listener = this.recorder.$state.subscribe(state => {
                switch (state) {
                    case VolumeBasedRecorderState.NotStarted:
                        this.$state.next(VoiceStreamState.Idle);
                        break;
                    case VolumeBasedRecorderState.Recording:
                        this.$state.next(VoiceStreamState.Recording);
                        break;
                }
            });

            await this.recorder.waitForComplete();
            this.recorder.destroy();
            this.$state.next(VoiceStreamState.Idle);
            listener.unsubscribe();

            if (!this.running) break;

            this.stream.push(this.recorder.wav());
        }
    }

    stop () {
        this.running = false;
    }
}