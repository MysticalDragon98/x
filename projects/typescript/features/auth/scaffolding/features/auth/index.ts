import { $assert, CustomErrors } from "@/features/errors";
import { CodeAuthenticator } from "./classes/CodeAuthenticator.class";

const Errors = CustomErrors({
    CodeAuthenticatorNotConfigured: () => `CodeAuthenticator is not configured in Auth`,
});

export interface AuthOptions {
    codeAuthenticator?: CodeAuthenticator;
}

export { CodeAuthenticator } from "./classes/CodeAuthenticator.class";
export { LogCodeAuthenticator } from "./classes/LogCodeAuthenticator.class";
export { OAuthProvider } from "./classes/OAuthProvider.class";
export type { OAuthUserInfo } from "./classes/OAuthProvider.class";

export class Auth {

    static #codeAuthenticator?: CodeAuthenticator;

    static init(options: AuthOptions) {
        this.#codeAuthenticator = options.codeAuthenticator;
    }

    static requestAuthenticationCode(identifier: string) {
        $assert(this.#codeAuthenticator, Errors.CodeAuthenticatorNotConfigured());

        return this.#codeAuthenticator!.requestCode(identifier);
    }

    static verifyAuthenticationCode(identifier: string, code: string) {
        $assert(this.#codeAuthenticator, Errors.CodeAuthenticatorNotConfigured());

        return this.#codeAuthenticator!.verifyCode(identifier, code);
    }

}
