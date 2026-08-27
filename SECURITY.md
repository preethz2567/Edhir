# Security Policy

## Supported Versions

Currently, all updates are provided to the `main` branch. Please ensure you are running the latest version.

## Secrets Management

**Never commit secrets to this repository.** 
- All credentials, API keys, and connection strings must be provided via environment variables.
- We provide `.env.*.example` files as templates. You must copy these to `.env.<environment>` and fill in your actual secrets locally or via your CI/CD platform.
- The `.gitignore` is configured to prevent committing `.env` files (except `.example` files).

## Reporting a Vulnerability

If you discover a security vulnerability within Edhir, please do not disclose it publicly. Instead, send an email to the security team or open a private GitHub advisory.

We will acknowledge receipt of your vulnerability report and strive to send you regular updates about our progress.

## API Key Rotation

Edhir supports zero-downtime API key rotation for tenants. If an API key is suspected to be compromised, or if you simply need to cycle keys as a security best practice:

1. **Issue a Rotation Request**: Make an authenticated POST request to `/tenants/{id}/rotate-key?gracePeriodHours=24`.
2. **Retrieve New Key**: The response will contain the newly generated primary `api_key`.
3. **Grace Period**: The previous API key is immediately moved to `secondary_api_key` and remains valid until the specified grace period expires.
4. **Update Clients**: Update all your protected applications to start sending the new API key. Both old and new keys will work concurrently.
5. **Revocation**: Once the grace period expires, requests using the old key will be automatically rejected.
