import { CLIResult } from '@/src/modules/cli/cli-result';
import { Crypto } from '../../crypto/scaffolding/features/crypto/index';
import * as fs from 'fs';
import * as path from 'path';
import IdentityFeature from '../identity.feature';

export default function keygen([], named: any, { feature }: { feature: IdentityFeature }): CLIResult {
    try {
        const keypair = Crypto.web3Keypair();
        
        const metaDir = path.resolve('.meta');
        if (!fs.existsSync(metaDir)) {
            fs.mkdirSync(metaDir, { recursive: true });
        }
        
        const identityPath = path.join(metaDir, 'identity');
        fs.writeFileSync(identityPath, JSON.stringify(keypair, null, 2));
        
        // Add .meta/identity to gitignore if not already present
        const gitignorePath = path.resolve('.gitignore');
        const gitignoreEntry = '.meta/identity';
        
        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            if (!gitignoreContent.includes(gitignoreEntry)) {
                fs.appendFileSync(gitignorePath, `\n${gitignoreEntry}\n`);
            }
        } else {
            fs.writeFileSync(gitignorePath, `${gitignoreEntry}\n`);
        }
        
        return CLIResult.success('Web3 keypair generated and stored', {
            address: keypair.address,
            path: identityPath
        });
    } catch (error) {
        return CLIResult.fromError(error);
    }
}