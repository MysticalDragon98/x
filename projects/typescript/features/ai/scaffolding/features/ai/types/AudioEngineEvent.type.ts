export type AudioEngineEvent = {
    type: "recording:start",
    device: string,
    timestamp: number
} | {
    type: "recording:end",
    device: string,
    wav: Buffer,
    timestamp: number
} | {
    type: "stt:start",
    device: string,
    wav: Buffer,
    timestamp: number
} | {
    type: "stt:end",
    device: string,
    wav: Buffer,
    text: string,
    timestamp: number
};