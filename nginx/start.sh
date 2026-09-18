#!/bin/sh
set -e

DOMAIN="${DOMAIN:-test.amitverma01.dev}"
export DOMAIN

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] \
  && [ -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]; then
  echo "nginx: using HTTPS config for ${DOMAIN}"
  envsubst '${DOMAIN}' < /etc/nginx/templates-src/https.conf.template \
    > /etc/nginx/conf.d/default.conf
else
  echo "nginx: using HTTP config for ${DOMAIN} (no certificate yet)"
  envsubst '${DOMAIN}' < /etc/nginx/templates-src/http.conf.template \
    > /etc/nginx/conf.d/default.conf
fi

nginx -t

trap '' HUP
(
  while true; do
    sleep 21600
    nginx -s reload 2>/dev/null || true
  done
) &

exec nginx -g "daemon off;"
