#!/bin/sh
set -e
trap '' HUP
(
  while true; do
    sleep 21600
    nginx -s reload 2>/dev/null || true
  done
) &
exec nginx -g "daemon off;"
