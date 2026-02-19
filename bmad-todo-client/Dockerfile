# syntax=docker/dockerfile:1
# Multistage Dockerfile: build stage (deps + Vite build), final stage (nginx, non-root).
# Build: docker build -t bmad-todo-client .
# Run:   docker run --rm -p 4173:8080 bmad-todo-client
# Verify: docker run --rm bmad-todo-client whoami  → webuser (not root)

# --- Build stage: Node, install deps, run production build ---
ARG NODE_VERSION=22
FROM docker.io/library/node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# Install dependencies (layer cache: package files first)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build (Vite outputs to dist/)
COPY . .
RUN npm run build

# --- Final stage: minimal runtime, non-root user only ---
FROM docker.io/library/nginx:alpine AS final

# Copy custom nginx config (listen 8080 for non-root)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only built assets from build stage (no node_modules or source)
COPY --from=build /app/dist /usr/share/nginx/html

# Non-root user: create and set ownership of nginx dirs
RUN adduser -D -H -u 1001 -s /sbin/nologin webuser && \
    chown -R webuser:webuser /usr/share/nginx/html && \
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chown -R webuser:webuser /var/run && \
    touch /var/run/nginx.pid && \
    chown webuser:webuser /var/run/nginx.pid

USER webuser

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
