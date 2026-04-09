export interface OAuthUserInfo {
    email: string;
    name?: string;
    picture?: string;
    emailVerified: boolean;
}

export abstract class OAuthProvider {

    abstract verifyToken(token: string): Promise<OAuthUserInfo>;

}
