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
