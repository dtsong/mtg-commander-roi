#!/bin/bash
set -euo pipefail

apt-get update
apt-get install -y --no-install-recommends curl ca-certificates

runuser -u ubuntu -- bash -lc "BUN_VERSION=1.3.6 curl -fsSL https://bun.sh/install | bash"

runuser -u ubuntu -- bash -lc "export BUN_INSTALL=\"$HOME/.bun\"; export PATH=\"$BUN_INSTALL/bin:$PATH\"; renovate"
