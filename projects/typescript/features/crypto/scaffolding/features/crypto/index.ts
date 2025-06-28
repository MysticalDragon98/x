        import * as crypto from 'crypto'

export class Crypto {
    static sha256 (value: string, salt?: string) {
        return crypto
            .createHash('sha256')
            .update(value + (salt || ''))
            .digest('hex');
    }
}