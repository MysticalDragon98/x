import { spawn } from "child_process";

export default class AudioFeature {
    
    static play (speech: ArrayBuffer) {
        return new Promise<void>((resolve, reject) => {
            const ffplay = spawn("ffplay", ["-autoexit", "-nodisp", "-i", "pipe:0"], {
                stdio: ["pipe", "ignore", "ignore"], // pipe stdin, ignore output
            });

            ffplay.stdin.write(speech);
            ffplay.stdin.end();

            ffplay.on("error", reject);
            ffplay.on("close", (code) => {
                if (code === 0) resolve();
                else reject(new Error(`ffplay exited with code ${code}`));
            });
        });
    }

}