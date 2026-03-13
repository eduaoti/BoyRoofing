# Backend Boys Roofing - NestJS + Prisma
# Una sola etapa: build y run en la misma imagen (así dist/ siempre existe)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate

COPY . .
RUN npm run build

# Nest genera dist/src/main.js (no dist/main.js)
RUN test -f dist/src/main.js || (echo "ERROR: dist/src/main.js no existe" && exit 1)

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
