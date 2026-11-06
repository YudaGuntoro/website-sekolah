#!/usr/bin/env bash
set -euo pipefail
: "${HEALTH_URL:?Set HEALTH_URL to the API readiness URL}"
if curl --fail --silent --show-error --max-time 10 "$HEALTH_URL" > /dev/null; then exit 0; fi
logger -p daemon.err -t cendekia-monitor 'Cendekia readiness probe failed'
# Optional existing monitoring agent command; no shell evaluation or embedded secrets.
if [[ -n "${ALERT_COMMAND:-}" ]]; then "$ALERT_COMMAND" 'Cendekia readiness probe failed'; fi
exit 1
