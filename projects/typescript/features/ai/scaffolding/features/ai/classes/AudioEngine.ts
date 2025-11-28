import { Subject } from "rxjs";
import { $assert, CustomErrors } from "@/features/errors";
import { VolumeBasedRecorder } from "@/features/audio/class/VolumeBasedRecorder";
import OpenAIFeature from "@/features/openai";
import { AudioSourceStatus } from "@/features/audio/enums/AudioSourceStatus.enum";
import { AudioEngineEvent } from "../types/AudioEngineEvent.type";

const Errors = CustomErrors({
    AudioSourceNotFound: (name: string) => `The audio source ${name} was not found.`,
    AudioSourceBusy: (name: string) => `The audio source ${name} is busy.`,
});

export class AudioEngine {
    
    static $text = new Subject<string>();
    static $status = new Subject<{ device: string, status: AudioSourceStatus }>();
    static $events = new Subject<AudioEngineEvent>();
    static sources: Record<string, {
        device: string;
        status: AudioSourceStatus;
    }> = {};

    static addSource (deviceName: string) {
        AudioEngine.sources[deviceName] = {
            device: deviceName,
            status: AudioSourceStatus.Idle
        };

        process.nextTick(() => {
            const source = AudioEngine.getSource(deviceName);
            AudioEngine.$status.next({
                device: deviceName,
                status: source.status
            });
        });
    }

    static async record (deviceName: string) {
        const source = AudioEngine.getSource(deviceName);
        $assert(source.status === AudioSourceStatus.Idle, Errors.AudioSourceBusy(deviceName));

        AudioEngine.$events.next({ type: "recording:start", device: deviceName, timestamp: Date.now() });
        AudioEngine.setSourceStatus(deviceName, AudioSourceStatus.Recording);
        const wav = await VolumeBasedRecorder.record(source.device, {
            destroyOnStop: true,
            maxConsecutiveSilences: 50,
            silenceThreshold: -10
        });
        AudioEngine.$events.next({ type: "recording:end", device: deviceName, wav, timestamp: Date.now() });
        AudioEngine.$events.next({ type: "stt:start", device: deviceName, wav, timestamp: Date.now() });
        const text = await OpenAIFeature.stt(wav);
        AudioEngine.$events.next({ type: "stt:end", device: deviceName, wav, text, timestamp: Date.now() });

        AudioEngine.$text.next(text);
        AudioEngine.setSourceStatus(deviceName, AudioSourceStatus.Idle);
        return text;
    }

    static setSourceStatus (deviceName: string, status: AudioSourceStatus) {
        const source = AudioEngine.getSource(deviceName);
        source.status = status;
        AudioEngine.$status.next(source);
    }

    static getSource (deviceName: string) {
        const source = AudioEngine.sources[deviceName];
        $assert(source, Errors.AudioSourceNotFound(deviceName));
        return source!;
    }
}