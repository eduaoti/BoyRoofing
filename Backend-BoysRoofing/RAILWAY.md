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

1. **Root Directory** (obligatorio): `Backend-BoysRoofing`.  
   Si está vacío o es la raíz del repo, el build usa el repo entero y **no** se compila el backend → al arrancar falla `Cannot find module '/app/dist/main.js'`. En el servicio Backend, Settings → **Root Directory** = `Backend-BoysRoofing`.
2. **Builder**: Dockerfile (`railway.toml` con `builder = "DOCKERFILE"`). La imagen hace `npm run build` en la misma etapa donde se ejecuta el proceso, así `dist/` siempre está en la imagen.
3. **DATABASE_URL**: debe estar definida (enlázala desde el servicio Postgres o pégala en Variables).

Con eso, cada deploy construye la imagen, aplica migraciones y arranca la API.
