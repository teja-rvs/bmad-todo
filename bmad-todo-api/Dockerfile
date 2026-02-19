# syntax=docker/dockerfile:1
# Multistage Dockerfile: build stage (deps + compile), final stage (runtime only, non-root).
# Build: docker build -t bmad-todo-api .
# Run:   docker run --rm -p 3000:3000 bmad-todo-api
# Note:  For server to start fully, set DATABASE_URL or use Compose (Story 7.3); entrypoint runs db:migrate before rails server.

ARG RUBY_VERSION=4.0.1
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS build

WORKDIR /rails

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends build-essential git libpq-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Install application gems (layer cache: Gemfile first)
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Copy application code
COPY . .

# Precompile bootsnap for faster boot (API-only: no asset pipeline; optional, so errors ignored)
RUN bundle exec bootsnap precompile -j 1 app/ lib/ 2>/dev/null || true

# --- Final stage: minimal runtime, non-root user only ---
FROM docker.io/library/ruby:${RUBY_VERSION}-slim AS final

WORKDIR /rails

# Runtime deps only (no build tools)
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends libpq5 curl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle"

# Non-root user: create and set ownership of app dirs (app, tmp, log, db, storage)
RUN groupadd --system --gid 1000 app && \
    useradd app --uid 1000 --gid 1000 --create-home --shell /bin/bash

# Copy only what is needed to run (gems + app from build stage)
COPY --chown=app:app --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=app:app --from=build /rails /rails

# Ensure writable dirs exist and are owned by app
RUN chown -R app:app /rails/app /rails/tmp /rails/log /rails/db /rails/storage 2>/dev/null || true

USER app

EXPOSE 3000

# Optional: prepare DB when starting server (runs as non-root)
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
