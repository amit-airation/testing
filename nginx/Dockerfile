FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY proxy_params /etc/nginx/proxy_params
COPY http.conf.template https.conf.template /etc/nginx/templates-src/
COPY select-ssl.sh /docker-entrypoint.d/99-select-ssl.sh
COPY start.sh /start.sh

RUN chmod +x /docker-entrypoint.d/99-select-ssl.sh /start.sh \
  && rm -f /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/nginx-health | grep -q ok || exit 1

CMD ["/start.sh"]
