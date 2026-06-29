# GitHub-native Secret Rotator setup

This repo is wired so Secret Rotator can be installed and run from GitHub Actions instead of the rented agent runtime.

## What was added

- `.github/workflows/secret-rotator.yml` exposes a manual GitHub Actions launcher and a daily scheduled check.
- `scripts/secret-rotator-github.sh` installs Secret Rotator from PyPI or GitHub source and runs a selected command.
- `config/secret-rotator-schedule.yaml` is the repo-owned schedule file that the workflow can validate.

## Required GitHub configuration

Add the relevant items under **Settings → Secrets and variables → Actions**.

### Variables

| Name | Purpose | Example |
| --- | --- | --- |
| `ROTATOR_PROVIDER` | Default provider for manual runs | `aws` |
| `ROTATOR_API_PORT` | API port when the package uses API mode | `8080` |
| `ROTATOR_LOG_LEVEL` | Logging verbosity | `info` |
| `AWS_REGION` | AWS region for AWS-backed secrets | `us-east-1` |
| `VAULT_ADDR` | Vault URL for Vault-backed secrets | `https://vault.example.com` |

### Secrets

| Name | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS access key for AWS provider |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for AWS provider |
| `VAULT_TOKEN` | Vault token for Vault provider |
| `AZURE_CLIENT_ID` | Azure service principal client id |
| `AZURE_CLIENT_SECRET` | Azure service principal secret |
| `AZURE_TENANT_ID` | Azure tenant id |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Full GCP service-account JSON |

## Manual run

1. Open **Actions → Secret Rotator API Generator** in GitHub.
2. Click **Run workflow**.
3. Choose the command:
   - `status` or `install` to prove the package installs.
   - `db-init` to initialize the package database if enabled by the provider package.
   - `rotate` to rotate one secret. Provide `provider` and `secret_id`.
   - `scheduler-check` to validate `config/secret-rotator-schedule.yaml`.
4. Choose `pypi` or `source`; use `source` when GitHub should install from `https://github.com/hallucinaut/secret-rotator.git` or another fork.

## Scheduled run

The workflow runs daily at 03:00 UTC and executes `scheduler-check` by default. Keep credential material in GitHub Secrets, not in the schedule file.

## Local parity

You can run the same wrapper locally for smoke testing:

```bash
ROTATOR_INSTALL_METHOD=pypi scripts/secret-rotator-github.sh status
```

For source installs:

```bash
ROTATOR_INSTALL_METHOD=source \
ROTATOR_SOURCE_REPO=https://github.com/hallucinaut/secret-rotator.git \
scripts/secret-rotator-github.sh status
```
