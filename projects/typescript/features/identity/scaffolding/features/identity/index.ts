import * as fs from 'fs';
import * as path from 'path';
import { Identity } from './classes/Identity.class';
import { $assert, CustomErrors } from '../errors';

const Errors = CustomErrors({
    IdentityNotFound: () => "No identity found at .meta/identity, generate one with the `x identity:keygen` command",
    InvalidIdentity: () => "Invalid identity found at .meta/identity, fix it or generate a new one with the `x identity:keygen` command"
})

export class IdentityFeature {

    identity!: Identity;

    init () {
        const identity = IdentityFeature.loadIdentity();
        $assert(identity, Errors.IdentityNotFound());

        this.identity = identity!;
    }

    static loadIdentity(): Identity | null {
        const identityPath = path.resolve('.meta', 'identity');
        if (!fs.existsSync(identityPath)) {
            return null;
        }
        
        try {
            const content = fs.readFileSync(identityPath, 'utf8');
            const { address, privKey } = JSON.parse(content);

            return new Identity({ address, privKey });
        } catch (error) {
            return null;
        }
    }
    
}