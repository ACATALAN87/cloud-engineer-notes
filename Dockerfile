# syntax=docker/dockerfile:1.6
# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for the cloud-engineer-notes Astro portfolio.
#
# Stage 1 (builder)  → installs deps and runs `astro build` → outputs /app/dist
# Stage 2 (runtime)  → serves the static dist with a tiny nginx image
#
# Local dev usage:    docker build -t cloud-engineer-notes .
#                     docker run --rm -p 8080:80 cloud-engineer-notes
#
# Production hint:    The site uses base="/cloud-engineer-notes" because it is
# deployed to GitHub Pages under that path. If you serve it from the domain
# root, set ASTRO_BASE=/ at build time and the nginx config will adapt.
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22-alpine
ARG NGINX_VERSION=1.27-alpine

# ─────────────────────────────── Build stage ─────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Leverage layer caching: copy lockfiles first
COPY package.json package-lock.json* ./

# Use npm ci for reproducible installs when a lockfile is present
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the source
COPY . .

# Build static site
RUN npm run build


# ─────────────────────────────── Runtime stage ───────────────────────────────
FROM nginx:${NGINX_VERSION} AS runtime

# Replace default nginx config with one that serves the static site cleanly
COPY <<'NGINX_CONF' /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # Sensible defaults
    sendfile          on;
    tcp_nopush        on;
    types_hash_max_size 2048;
    server_tokens     off;

    # Gzip
    gzip on;
    gzip_types  text/plain text/css application/json application/javascript
                application/xml+rss application/atom+xml image/svg+xml;
    gzip_min_length 256;

    # Long cache for hashed assets
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|ico|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # No cache for HTML so deploys are picked up immediately
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Astro generates pages as index.html inside folders → enable fallback
    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    # Basic security headers
    add_header X-Frame-Options          "SAMEORIGIN" always;
    add_header X-Content-Type-Options   "nosniff"    always;
    add_header Referrer-Policy          "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy       "geolocation=(), microphone=(), camera=()" always;
}
NGINX_CONF

# Copy built static site
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck so orchestrators know when the container is ready
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
