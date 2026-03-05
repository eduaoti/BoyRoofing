# Despliegue en Railway

## Crear las tablas nuevas en producción (Worker, PayrollPeriod, etc.)

Si las tablas de nómina no aparecen en Postgres de Railway, aplica las migraciones así:

### Opción 1: Desde tu PC (una sola vez)

1. En Railway → servicio **Postgres** → pestaña **Connect** (o **Variables**) y copia la **DATABASE_URL**.
2. En tu terminal, desde la raíz del repo:

```bash
cd Backend-BoysRoofing
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/railway?sslmode=require" npx prisma migrate deploy
```

(Pega la URL real que te da Railway. Si tiene parámetros como `?schema=public` déjalos.)

3. Verifica en Railway → Postgres → Database → Data que existan las tablas **Worker**, **PayrollPeriod**, **PayrollEntry**, **WorkDay**.

### Opción 2: Que Railway las aplique en cada deploy

En el servicio **BoyRoofing** (backend):

1. **Settings** → **Build** → si el "Root Directory" es la raíz del repo, pon `Backend-BoysRoofing`.
2. **Settings** → **Deploy** → **Custom Start Command** (o Start Command):

   - Si Root Directory = `Backend-BoysRoofing`:  
     `npm run start:railway`
   - Si Root Directory = raíz del repo:  
     `cd Backend-BoysRoofing && npm run start:railway`

3. Guarda y haz **Redeploy** del servicio.

Así, en cada arranque se ejecutará `prisma migrate deploy` antes de levantar la API y se crearán o actualizarán las tablas.
