export class AudioUtils {
    
    static pcmToWav (pcm: Buffer, sampleRate = 16000, channels = 1, bitsPerSample = 16) {
        const byteRate = sampleRate * channels * bitsPerSample / 8;
        const blockAlign = channels * bitsPerSample / 8;
        const dataSize = pcm.length;
        const buffer = Buffer.alloc(44 + dataSize);

        buffer.write('RIFF', 0);
        buffer.writeUInt32LE(36 + dataSize, 4);
        buffer.write('WAVE', 8);
        buffer.write('fmt ', 12);
        buffer.writeUInt32LE(16, 16);
        buffer.writeUInt16LE(1, 20);
        buffer.writeUInt16LE(channels, 22);
        buffer.writeUInt32LE(sampleRate, 24);
        buffer.writeUInt32LE(byteRate, 28);
        buffer.writeUInt16LE(blockAlign, 32);
        buffer.writeUInt16LE(bitsPerSample, 34);
        buffer.write('data', 36);
        buffer.writeUInt32LE(dataSize, 40);
        
        pcm.copy(buffer, 44);

        return buffer;
    }

}