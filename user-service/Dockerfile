    FROM node:20-alpine AS builder
    WORKDIR /app

    COPY package*.json ./
    RUN npm ci

    COPY . .
    RUN npm run build
    RUN npm prune --omit=dev

    FROM node:20-alpine AS runner
    WORKDIR /app

    ENV NODE_ENV=production

    # Port will always come from .env file
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist

    EXPOSE 3001
    CMD ["node", "dist/index.cjs"]
