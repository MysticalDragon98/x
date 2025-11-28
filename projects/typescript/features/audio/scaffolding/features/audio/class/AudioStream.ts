import { ChildProcess, spawn } from "child_process";
import { Transform } from "stream";
import { AudioChunk } from "./AudioChunk";
import { $assert, CustomErrors } from "@/features/errors";

const Errors = CustomErrors({
    MissingStdout: "Could not create audio stream, child process has no stdout"
});

export class AudioStream {

    stream!: Transform;

    private constructor (private child: ChildProcess) {
        $assert(child.stdout, Errors.MissingStdout());
        this.setupListeners();
    }

    static create (target: string) {
        const child = spawn("pw-cat", ["--record", "--target", target, "--format", "s16", "--rate", "16000", "--channels", "1", "-"]);

        return new AudioStream(child);
    }

    destroy () {
        this.child.kill();
        this.stream.removeListener("data", this.onData);
    }

    onData (cb: (chunk: AudioChunk) => any) {
        this.stream.on("data", cb);
        return cb;
    }

    removeListeners (listeners: any[]) {
        listeners.forEach(listener => this.stream.removeListener("data", listener));
    }

    setupListeners () {
        this.stream = this.child.stdout!.pipe(new Transform({
            objectMode: true,

            transform (chunk, encoding, callback) {
                callback(null, new AudioChunk(chunk));
            }

        }));

        this.child.stderr!.pipe(process.stderr);
    }

}