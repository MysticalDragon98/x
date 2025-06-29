import * as crypto from 'crypto'
import { privateToAddress, privateToPublic, toChecksumAddress } from 'ethereumjs-util'

export class Crypto {

    static sha256 (value: string, salt?: string) {
        return crypto
            .createHash('sha256')
            .update(value + (salt || ''))
            .digest('hex');
    }

    static web3Keypair(): { address: string, privKey: string } {
        // Generate random 32-byte private key
        const privateKey = crypto.randomBytes(32);
        
        // Generate Ethereum address from private key
        const address = privateToAddress(privateKey);
        
        return {
            address: toChecksumAddress('0x' + address.toString('hex')),
            privKey: '0x' + privateKey.toString('hex')
        };
    }

}