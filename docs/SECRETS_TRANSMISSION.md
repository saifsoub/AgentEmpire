# Safe secrets transmission flow

This runbook addresses DONEAI-55 with a practical "safe enough" process for getting environment secrets from the operator into the private project area without committing them to git.

## Principle

Do not send raw `.env` files through chat, issues, commits, screenshots, or shared docs. Use the static intake page at `public/secret-intake.html` to encrypt the values in the browser, then store only the encrypted payload in the private project area. Share the passphrase through a separate channel.

This follows common OWASP guidance: keep secrets out of source control, transmit sensitive material over protected channels, and rotate exposed credentials.

## Static intake page

Host or open this file:

```txt
public/secret-intake.html
```

Properties:

- Self-contained static HTML; no build step is needed.
- Runs fully in the browser.
- Uses Web Crypto `PBKDF2` + `AES-GCM` to encrypt the submitted key/value data.
- Does not send network requests.
- Produces a downloadable encrypted JSON payload.

## Operator flow

1. Open the hosted `secret-intake.html` page over HTTPS, or open it locally from the repo.
2. Paste only the variables needed for the target environment.
3. Enter a strong one-time passphrase.
4. Click **Encrypt secrets**.
5. Download the encrypted JSON payload.
6. Upload that encrypted payload to the private project area.
7. Share the passphrase through a different channel than the encrypted file.
8. After the receiver confirms import, delete any temporary plaintext notes and rotate anything that may have been exposed.

## Receiver flow

1. Download the encrypted JSON payload from the private project area.
2. Open the same `secret-intake.html` page.
3. Use **Decrypt an existing payload** with the passphrase received separately.
4. Copy the plaintext into the hosting provider's secret manager or a local `.env.local`.
5. Run `npm run readiness`, `npm run typecheck`, and `npm run test`.
6. Delete the decrypted plaintext after the environment is confirmed.

## Safety limits

This flow is a handoff mechanism, not a long-term vault. For production, prefer the hosting platform's secret manager, a cloud secret manager, or a dedicated team vault. Never commit the encrypted payload, passphrase, or decrypted `.env.local` to git.
