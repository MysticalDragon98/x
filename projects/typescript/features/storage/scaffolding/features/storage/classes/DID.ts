import { $assert, CustomErrors } from "@/features/errors";
import { randomUUID } from "node:crypto";

const Errors = CustomErrors({
    DidTypeMismatch: (expected: string, actual: string) => `DID type mismatch. Expected "${expected}", got "${actual}"`,
    InvalidUUID: () => `Invalid UUID in DID`,
});

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class DID {
    static validate({ did, type }: { did: string; type: string }) {
        $assert(typeof did === "string", Errors.InvalidUUID());

        const [actualType, uuid] = did.split(":");

        $assert(actualType === type, Errors.DidTypeMismatch(type, actualType));
        $assert(UUID_V4_REGEX.test(uuid), Errors.InvalidUUID());

        return true;
    }

    static create(type: string) {
        return `${type}:${randomUUID()}`;
    }
}
