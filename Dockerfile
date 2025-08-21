# Lightweight Nginx to serve the static Bible app
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy app files to the default web root
COPY . /usr/share/nginx/html

# Ensure permissions (non-root container user is not typical with nginx:alpine; keep root)

EXPOSE 80

# Simple healthcheck: test that index.html is served
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ | grep -qi '<!DOCTYPE html>' || exit 1
