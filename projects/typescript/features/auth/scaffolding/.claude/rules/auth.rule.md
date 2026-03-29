# Auth Feature

Provides code-based authentication (OTP/PIN) with an in-memory store.

## Setup

Call `Auth.init()` once at app startup with a `CodeAuthenticator`:

```typescript
import { Auth, CodeAuthenticator } from "@/features/auth";

// Development — logs codes to console
Auth.init({
    codeAuthenticator: CodeAuthenticator.log()
});

// Production — provide a custom sender (SMS, email, etc.)
Auth.init({
    codeAuthenticator: CodeAuthenticator.default(async (code, destination) => {
        await smsService.send(destination, `Your code: ${code}`);
    })
});
```

## Flow

1. **Request a code** — sends a code to the identifier (phone, email, etc.)
2. **Verify the code** — confirms the code and clears it from the store

```typescript
await Auth.requestAuthenticationCode(identifier);
await Auth.verifyAuthenticationCode(identifier, code);
```

## CodeAuthenticator options

| Option            | Default    | Description                              |
|-------------------|------------|------------------------------------------|
| `codeLength`      | `6`        | Number of digits in the code             |
| `expiryTime`      | `5 min`    | How long a code is valid (ms)            |
| `refreshInterval` | `1 min`    | Minimum time before re-sending (ms)      |
| `maxTries`        | `5`        | Failed attempts before invalidation      |

```typescript
CodeAuthenticator.default(sender, {
    codeLength: 4,
    expiryTime: 3 * 60 * 1000,
    refreshInterval: 30 * 1000,
    maxTries: 3
});
```

## Notes

- Codes are stored in-memory — restarting the process clears all pending verifications
- Calling `requestAuthenticationCode` within `refreshInterval` of the last send is a no-op
- After `maxTries` failed attempts the entry is deleted and the user must request a new code
