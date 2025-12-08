# ---- Build Stage ----
FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Copy everything (server, src, env example)

# No build step (plain JS), but keep here for TypeScript or transpile:
# RUN npm run build

# ---- Production Stage ----
FROM node:22-slim
WORKDIR /app

COPY --from=builder /app /app
RUN npm prune --production

EXPOSE 4000
CMD ["npm", "start"]