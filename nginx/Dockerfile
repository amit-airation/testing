FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/nginx.conf
COPY proxy_params /etc/nginx/proxy_params
COPY http.conf.template https.conf.template /etc/nginx/templates-src/
COPY start.sh /start.sh

RUN chmod +x /start.sh \
  && rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /var/www/certbot

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD curl -fsS http://127.0.0.1/nginx-health

CMD ["/start.sh"]
