# Backend Boys Roofing - NestJS + Prisma
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# Imagen final solo con lo necesario para ejecutar
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
