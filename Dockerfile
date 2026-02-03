# OpsMind Frontend - Container image
# Serves static files via nginx

FROM nginx:1.27-alpine

# Nginx config (SPA-friendly, but this app is multi-page so default index fallback is harmless)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static site content
COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
