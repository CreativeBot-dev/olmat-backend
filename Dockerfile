FROM node:20.17.0 AS base

# Build code
FROM base AS builder
WORKDIR /app

# Salin semua file
COPY . .

# Install dependencies dan build
RUN mkdir -p storage/imgs storage/attachments
RUN cp .env.example .env \
    && yarn install --frozen-lockfile \
    && yarn build
    

# Production image
FROM base AS prod
WORKDIR /app

# Salin hasil build dan file yang diperlukan
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/storage ./storage
COPY --from=builder /app/.env .env

EXPOSE 8000

CMD ["node", "dist/main.js"]