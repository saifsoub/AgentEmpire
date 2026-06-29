#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:-status}"
INSTALL_METHOD="${ROTATOR_INSTALL_METHOD:-pypi}"
SOURCE_REPO="${ROTATOR_SOURCE_REPO:-https://github.com/hallucinaut/secret-rotator.git}"
PACKAGE_NAME="${ROTATOR_PACKAGE:-secret-rotator}"
WORKDIR="${RUNNER_TEMP:-/tmp}/secret-rotator-src"

install_rotator() {
  python -m pip install --upgrade pip

  case "$INSTALL_METHOD" in
    pypi)
      python -m pip install "$PACKAGE_NAME"
      ;;
    source)
      rm -rf "$WORKDIR"
      git clone "$SOURCE_REPO" "$WORKDIR"
      python -m pip install "$WORKDIR"
      ;;
    *)
      echo "Unsupported ROTATOR_INSTALL_METHOD: $INSTALL_METHOD" >&2
      exit 2
      ;;
  esac
}

run_rotator() {
  case "$COMMAND" in
    install|status)
      secret-rotator --help
      ;;
    db-init)
      secret-rotator db init
      ;;
    rotate)
      : "${ROTATOR_SECRET_ID:?Set ROTATOR_SECRET_ID for rotate}"
      secret-rotator rotate --secret-id "$ROTATOR_SECRET_ID" --provider "${ROTATOR_PROVIDER:-aws}"
      ;;
    scheduler-check)
      secret-rotator scheduler validate --config "${ROTATOR_SCHEDULE_CONFIG:-config/secret-rotator-schedule.yaml}"
      ;;
    *)
      echo "Unsupported command: $COMMAND" >&2
      echo "Supported: install, status, db-init, rotate, scheduler-check" >&2
      exit 2
      ;;
  esac
}

install_rotator
run_rotator
