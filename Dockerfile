# Build stage. `nuxt build` copies native modules such as sharp (@nuxt/image / ipx) into .output
# for the platform it runs on, so it must match the runtime stage: same libc (alpine/musl) and
# the TARGET CPU (no --platform=$BUILDPLATFORM).
FROM node:24-alpine AS build

# Set the working directory inside the container
WORKDIR /app
# Copy package.json and pnpm-lock.yaml files to the working directory
COPY ./package.json /app/
COPY ./pnpm-workspace.yaml* /app/
COPY ./pnpm-lock.yaml* /app/

# pnpm version from package.json "packageManager" (corepack ships with Node 24)
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
## Install dependencies exactly as locked; fails if pnpm-lock.yaml is out of date
RUN pnpm install --frozen-lockfile --shamefully-hoist --ignore-scripts

# Copy the rest of the application files to the working directory
COPY . ./

ENV CI=true

RUN pnpm postinstall

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm build

# Production stage
FROM node:24-alpine

# Set timezone
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install PM2
RUN npm install -g pm2@7.0.4

# Set environment to production
ENV NODE_ENV=production

# Use non-root user
USER node
WORKDIR /app

# Copy built artifacts with correct permissions
COPY --chown=node:node --from=build /app/.output /app
# COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/ecosystem.config.cjs /app

# Static file: no SSR render and no backend call, so the check does not load the API and does not
# fail while the backend is down. start-interval answers `docker compose up --wait` quickly.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --start-interval=2s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/favicon.ico || exit 1

      # ปิด update check และ telemetry ของ PM2
ENV PM2_DISCOVERY=false
ENV PM2_SILENT=true
# Use PM2 to run the application
CMD ["pm2-runtime", "ecosystem.config.cjs"]
