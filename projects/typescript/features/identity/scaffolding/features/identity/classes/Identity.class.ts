import { z } from 'zod';
import { ZodFeature } from '../../zod';
import { bufferToHex, ecrecover, ecsign, fromRpcSig, hashPersonalMessage, publicToAddress, toRpcSig } from 'ethereumjs-util';
import { $assert, CustomErrors } from '@/features/errors';

const IdentitySchema = z.object({
    address: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Address must be a valid Ethereum address (0x followed by 40 hex characters)'),
    privKey: z.string()
        .regex(/^0x[a-fA-F0-9]{64}$/, 'Private key must be a valid hex string (0x followed by 64 hex characters)')
});

const Errors = CustomErrors({
    InvalidBase64Token: () => "The provided token is not a valid base64 string",
    InvalidTokenJsonString: () => "The provided token is not a valid JSON string",
    InvalidTokenSignature: () => "The provided token signature is not a valid base64 string",
    SignatureMismatch: () => "The token signature is corrupted",
    TokenExpired: () => "The provided token has expired"
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

    createSignature (msg: string | Buffer) {
        const privateKey = Buffer.from(this.#privKey.slice(2), 'hex');
        const messageBuffer = Buffer.from(msg);
        const prefixedHash = hashPersonalMessage(messageBuffer);
        const signature = ecsign(prefixedHash, privateKey);

        return toRpcSig(signature.v, signature.r, signature.s);
    }

    createToken (payload: any, { ttl, type }: { ttl: number, type: string }) {
        const data = JSON.stringify({
            ...payload,
            type: type,
            ttl,
            iat: Date.now(),
        });
        
        const signature = this.createSignature(data);

        return Buffer.from(data).toString("base64") + "." + Buffer.from(signature).toString("base64");
    }

    decodeToken<T> (token: string) {
        const [payload, signature] = token.split(".");   
        const rawPayload = $assert(
            () => Buffer.from(payload, "base64").toString("utf8"),
            Errors.InvalidBase64Token()
        );

        const decodedPayload = $assert(
            () => JSON.parse(rawPayload),
            Errors.InvalidTokenJsonString()
        );
        
        const decodedSignature = $assert(
            () => Buffer.from(signature, "base64").toString("utf8"),
            Errors.InvalidTokenSignature()
        );

        const msgBuffer = Buffer.from(rawPayload);
        const msgHash = hashPersonalMessage(msgBuffer);
        const signatureParams = fromRpcSig(decodedSignature);
        const pubKey = ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
        
        const addressBuffer = publicToAddress(pubKey);
        const address = bufferToHex(addressBuffer);

        if (decodedPayload.iat && decodedPayload.ttl) {
            $assert(decodedPayload.iat + decodedPayload.ttl > Date.now(), Errors.TokenExpired());
        }

        $assert(address.toLowerCase() === this.address.toLowerCase(), Errors.SignatureMismatch());

        return decodedPayload as T;
    }

}