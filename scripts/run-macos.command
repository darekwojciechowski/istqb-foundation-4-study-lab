#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/.."

pause_on_error() {
  local exit_code=$?
  if [ "$exit_code" -ne 0 ]; then
    echo
    echo "The app could not be started. Press Enter to close this window."
    read -r _ || true
  fi
  exit "$exit_code"
}

trap pause_on_error EXIT

echo "Starting CTFL 4.0 Study Lab..."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found."
  echo "Install Node.js 24 or newer from https://nodejs.org/ and run this script again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found."
  echo "Install Node.js 24 or newer from https://nodejs.org/ and run this script again."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies with npm ci..."
  npm ci
  echo
fi

echo "Opening the app in your default browser..."
npm run dev -- --host 127.0.0.1 --open
