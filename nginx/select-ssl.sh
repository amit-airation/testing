#!/bin/sh
set -e
DOMAIN="${DOMAIN:-test.amitverma01.dev}"
export DOMAIN

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] \
  && [ -f "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" ]; then
  envsubst '${DOMAIN}' < /etc/nginx/templates-src/https.conf.template \
    > /etc/nginx/conf.d/default.conf
else
  envsubst '${DOMAIN}' < /etc/nginx/templates-src/http.conf.template \
    > /etc/nginx/conf.d/default.conf
fi
