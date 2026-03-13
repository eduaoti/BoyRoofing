# Despliegue en Railway

## Variables obligatorias en el servicio Backend

En Railway → tu servicio Backend → **Variables**, configura:

| Variable       | Descripción |
|----------------|-------------|
| `DATABASE_URL` | URL de PostgreSQL. En Railway: Postgres → Connect → **Postgres connection URL** (ej. `postgresql://postgres:xxx@interchange.proxy.rlwy.net:46392/railway`). |
| `JWT_SECRET`   | Secreto para el login del admin (string largo y aleatorio). |

Opcionales: `RESEND_API_KEY`, `FROM_EMAIL` (correo), `MAPBOX_TOKEN` (detección de techo).

---

## Migraciones y tablas

Las migraciones se aplican **al arrancar** el backend con `scripts/railway-start.sh` (`prisma migrate deploy` + `node dist/main.js`).

Si en algún momento quieres aplicar migraciones **solo una vez** desde tu PC contra la base de Railway:

1. Railway → Postgres → **Variables** → copia `DATABASE_URL` (o la connection URL).
2. En tu terminal:

```bash
cd Backend-BoysRoofing
DATABASE_URL="postgresql://postgres:xxx@interchange.proxy.rlwy.net:46392/railway" npx prisma migrate deploy
```

(No subas la URL con contraseña al repo.)

---

## Configuración del servicio en Railway

1. **Root Directory**: `Backend-BoysRoofing`.
2. **Start Command**: se usa el de `railway.toml` (`sh scripts/railway-start.sh`) o en **Settings** → **Deploy** puedes poner: `sh scripts/railway-start.sh` o `npm run start:prod`.
3. **DATABASE_URL**: debe estar definida (enlázala desde el servicio Postgres o pégala en Variables).

Con eso, cada deploy aplica migraciones y arranca la API.
