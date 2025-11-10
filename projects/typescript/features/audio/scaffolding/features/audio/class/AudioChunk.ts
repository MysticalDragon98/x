export class AudioChunk {

    #volume?: number;

    constructor (private buffer: Buffer) {}

    volume () {
        if (this.#volume === undefined) {
            this.#volume = this.#calculateVolume();
        }

        return this.#volume;
    }

    buf () {
        return this.buffer;
    }

    #calculateVolume () {
        const samples = this.buffer.length / 2;
        let sumSq = 0;
        for (let i = 0; i < samples; i++) {
            const s = this.buffer.readInt16LE(i * 2);
            sumSq += s * s;
        }

        const rms = Math.sqrt(sumSq / samples);
        return 20 * Math.log10(rms / 32768);
    }

}