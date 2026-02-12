import { Crypto } from "@/features/crypto";
import TypescriptProject from "../..";
import { Feature } from "../../../../src/modules/projects/feature";
import CryptoFeature from "../crypto/crypto.feature";

export default class IdentityFeature extends Feature<TypescriptProject> {
    readonly crypto = this.inject<CryptoFeature>(CryptoFeature);

    version() { return "0.0.1"; }
    name() { return "p4p"; }

    async init() {
        // No additional dependencies needed beyond crypto
        await this.project.install([
            "@libp2p/interface",
            "@chainsafe/libp2p-yamux",
            "it-pipe",
            "it-length-prefixed",
            "ethers",
            "@mysticaldragon/proxies",
            "@libp2p/peer-id",
            "blockstore-fs",
            "@libp2p/kad-dht",
            "helia",
            "@helia/json",
            "datastore-fs",
            "@chainsafe/libp2p-gossipsub"
        ]);
    }

}