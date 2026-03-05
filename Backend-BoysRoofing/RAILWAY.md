# Despliegue en Railway

## Crear las tablas nuevas en producción (Worker, PayrollPeriod, etc.)

En Railway solo ves `_prisma_migrations`, `AdminUser`, `Invoice`, `Quote`, `Review`. Faltan **Worker**, **PayrollPeriod**, **PayrollEntry**, **WorkDay**. Para crearlas:

---

### Opción A: Desde tu PC (rápido, una vez)

1. En **Railway** → proyecto **skillful-miracle** → servicio **Postgres**.
2. Pestaña **Variables** (o **Connect**) y copia el valor de **DATABASE_URL** (o la connection URL que te muestre).
3. En tu terminal:

```bash
cd Backend-BoysRoofing
DATABASE_URL="PEGA_AQUÍ_LA_URL_DE_RAILWAY" npx prisma migrate deploy
```

4. Deberías ver algo como `Applying migration 20260304235839_add_payroll`.
5. En Railway → Postgres → **Database** → **Data** → refresca: deben aparecer **Worker**, **PayrollPeriod**, **PayrollEntry**, **WorkDay**.

---

### Opción B: Que Railway ejecute las migraciones al arrancar

En el servicio **BoyRoofing** (el de `api.boysroofing.company`):

1. Entra en **Settings** del servicio BoyRoofing.
2. En **Build** (o **General**):
   - **Root Directory**: debe ser `Backend-BoysRoofing` para que el backend y la carpeta `prisma/` estén en la raíz del build. Si está vacío o es la raíz del repo, cámbialo a `Backend-BoysRoofing`.
3. En **Deploy** (o donde esté el comando de arranque):
   - **Start Command** (o Custom Start Command): pon exactamente uno de estos:
     - Si Root Directory = `Backend-BoysRoofing`:  
       `sh scripts/railway-start.sh`  
       (o `npm run start:prod`)
     - Si no usas Root Directory y el repo entero se despliega:  
       `cd Backend-BoysRoofing && npm run start:prod`
4. Guarda y haz **Redeploy** del servicio BoyRoofing.

El script `scripts/railway-start.sh` ejecuta `prisma migrate deploy` y luego `node dist/main.js`, así que las tablas se crean o actualizan en cada deploy.

**Importante:** La variable **DATABASE_URL** debe estar disponible para el servicio BoyRoofing (en Railway suele enlazarse desde Postgres → Variables → referencia a `DATABASE_URL`).
