# Google OAuth Feature

Provides Google OAuth token verification via the `GoogleOAuthProvider` class.

## Usage

```typescript
import { GoogleOAuth } from "@/features/google-oauth";

const userInfo = await GoogleOAuth.verifyToken(idToken);
// => { email, name, picture, emailVerified }
```

## Dependencies

- **auth** — extends `OAuthProvider` base class
- **errors** — uses `$assert` and `CustomErrors` for validation
- **env** — reads `GoogleClientId` from environment

## Environment Variables

| Variable         | Required | Description                          |
|------------------|----------|--------------------------------------|
| `GOOGLE_CLIENT_ID` | Yes    | Google OAuth 2.0 Client ID          |

## How it works

1. Sends the ID token to Google's `tokeninfo` endpoint for verification
2. Validates the `aud` claim matches the configured `GoogleClientId`
3. Checks that the email is verified
4. Returns `OAuthUserInfo` with `email`, `name`, `picture`, and `emailVerified`

## Error types

- `InvalidToken` — empty or falsy token provided
- `TokenVerificationFailed` — Google returned a non-OK response
- `ClientIdMismatch` — token was issued for a different application
- `EmailNotVerified` — the Google account's email is not verified
