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

# Comprobar que dist se generó (si falla, el build de Railway falla y vemos el error)
RUN test -f dist/main.js || (echo "ERROR: dist/main.js no existe" && exit 1)

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
