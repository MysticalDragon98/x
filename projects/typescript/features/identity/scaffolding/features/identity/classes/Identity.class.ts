import { z } from 'zod';
import { ZodFeature } from '../../zod';

const IdentitySchema = z.object({
    address: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Address must be a valid Ethereum address (0x followed by 40 hex characters)'),
    privKey: z.string()
        .regex(/^0x[a-fA-F0-9]{64}$/, 'Private key must be a valid hex string (0x followed by 64 hex characters)')
});

export class Identity {

    readonly address: string;
    readonly #privKey: string;

    constructor ({ address, privKey }: { address: string, privKey: string }) {
        const validated = ZodFeature.validate<{ address: string, privKey: string }>(
            IdentitySchema, 
            { address, privKey }
        );
        
        this.address = validated.address;
        this.#privKey = validated.privKey;
    }


}