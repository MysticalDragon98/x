import { OAuthProvider, type OAuthUserInfo } from "@/features/auth";
import { $assert, CustomErrors } from "@/features/errors";
import { Environment } from "@/features/env";

const Errors = CustomErrors({
    InvalidToken: () => `The provided Google OAuth token is invalid`,
    TokenVerificationFailed: (reason: string) => `Google token verification failed: ${reason}`,
    EmailNotVerified: () => `The email associated with this Google account is not verified`,
    ClientIdMismatch: () => `The token was not issued for this application`,
});

interface GoogleTokenPayload {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: string | boolean;
    name?: string;
    picture?: string;
    iat: string;
    exp: string;
}

const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

export class GoogleOAuthProvider extends OAuthProvider {

    async verifyToken(idToken: string): Promise<OAuthUserInfo> {
        $assert(idToken, Errors.InvalidToken());

        const response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(idToken)}`);

        $assert(response.ok, Errors.TokenVerificationFailed(
            `Google responded with status ${response.status}`
        ));

        const payload: GoogleTokenPayload = await response.json();

        $assert(
            payload.aud === Environment.GoogleClientId,
            Errors.ClientIdMismatch()
        );

        const emailVerified = payload.email_verified === true
            || payload.email_verified === "true";

        return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified,
        };
    }

}
