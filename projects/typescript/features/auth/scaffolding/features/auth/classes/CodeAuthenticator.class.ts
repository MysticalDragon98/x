import { $assert, CustomErrors } from "@/features/errors";
import { LogCodeAuthenticator } from "./LogCodeAuthenticator.class";

const Errors = CustomErrors({
    InvalidCodeLength: () => `codeLength must be a positive integer`,
    InvalidExpiryTime: () => `expiryTime must be a positive number`,
    InvalidRefreshInterval: () => `refreshInterval must be a non-negative number`,
    InvalidMaxTries: () => `maxTries must be a positive integer`,
    InvalidSendCode: () => `sendCode must be a function`,

    VerificationNotFound: () => `No active verification found`,
    VerificationExpired: () => `Verification code expired`,
    InvalidCodeFormat: () => `Invalid code format`,
    InvalidCode: (triesLeft: number) =>
        `Invalid code. ${triesLeft} attempt(s) remaining`,
    MaxTriesExceeded: () => `Maximum verification attempts exceeded`,
});

interface CodeAuthenticatorOptions {
    codeLength: number;
    expiryTime: number;       // ms
    refreshInterval: number;  // ms
    maxTries: number;
    sendCode: SenderFunction;
}

type SenderFunction = (code: string, destination: string) => void | Promise<void>;
type CodeEntry = {
    code: string;
    expiresAt: number;
    lastSentAt: number;
    triesLeft: number;
};

export class CodeAuthenticator {

    readonly codeLength: number;
    readonly expiryTime: number;
    readonly refreshInterval: number;
    readonly maxTries: number;
    readonly sendCode: SenderFunction;

    private store = new Map<string, CodeEntry>();

    constructor(options: CodeAuthenticatorOptions) {
        $assert(Number.isInteger(options.codeLength) && options.codeLength > 0, Errors.InvalidCodeLength());
        $assert(options.expiryTime > 0, Errors.InvalidExpiryTime());
        $assert(options.refreshInterval >= 0, Errors.InvalidRefreshInterval());
        $assert(Number.isInteger(options.maxTries) && options.maxTries > 0, Errors.InvalidMaxTries());
        $assert(typeof options.sendCode === "function", Errors.InvalidSendCode());

        this.codeLength = options.codeLength;
        this.expiryTime = options.expiryTime;
        this.refreshInterval = options.refreshInterval;
        this.maxTries = options.maxTries;
        this.sendCode = options.sendCode;
    }

    async requestCode(destination: string): Promise<void> {
        const now = Date.now();

        const existing = this.store.get(destination);
        if (existing && now - existing.lastSentAt < this.refreshInterval) {
            return;
        }

        const code = this.generateCode();

        this.store.set(destination, {
            code,
            expiresAt: now + this.expiryTime,
            lastSentAt: now,
            triesLeft: this.maxTries,
        });

        await this.sendCode(code, destination);
    }

    verifyCode(destination: string, code: string): true {
        $assert(typeof code === "string", Errors.InvalidCodeFormat());

        const entry = this.store.get(destination)!;

        $assert(!!entry, Errors.VerificationNotFound());

        if (Date.now() > entry.expiresAt) {
            this.store.delete(destination);
            throw Errors.VerificationExpired();
        }

        if (entry.code !== code) {
            entry.triesLeft--;

            if (entry.triesLeft <= 0) {
                this.store.delete(destination);
                throw Errors.MaxTriesExceeded();
            }

            throw Errors.InvalidCode(entry.triesLeft);
        }

        this.store.delete(destination);
        return true;
    }

    invalidate(destination: string): void {
        this.store.delete(destination);
    }

    private generateCode(): string {
        const max = 10 ** this.codeLength;
        return Math.floor(Math.random() * max)
            .toString()
            .padStart(this.codeLength, "0");
    }

    static default(sender: SenderFunction, options?: Omit<Partial<CodeAuthenticatorOptions>, "sendCode">) {
        return new CodeAuthenticator({
            codeLength: options?.codeLength ?? 6,
            expiryTime: options?.expiryTime ?? 5 * 60 * 1000,        // 5 minutes
            refreshInterval: options?.refreshInterval ?? 60 * 1000,  // 1 minute
            maxTries: options?.maxTries ?? 5,
            sendCode: sender
        });
    }

    static log(options?: Omit<Partial<CodeAuthenticatorOptions>, "sendCode">) {
        return CodeAuthenticator.default(LogCodeAuthenticator, options);
    }

}
