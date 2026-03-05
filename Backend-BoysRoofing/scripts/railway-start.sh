#!/bin/sh
set -e
# Ejecutar migraciones en la DB de Railway y luego arrancar la API
npx prisma migrate deploy
exec node dist/main.js
