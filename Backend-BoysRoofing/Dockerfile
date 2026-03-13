# Backend Boys Roofing - NestJS + Prisma (Node 20 para NestJS 11+)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
# DATABASE_URL no existe en build; prisma generate solo genera el cliente
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate

COPY . .
RUN npm run build

# Imagen final solo con lo necesario para ejecutar
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
