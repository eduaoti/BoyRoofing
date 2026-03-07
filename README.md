# Boy's Roofing

Sitio web corporativo y panel de administración para **Boy's Roofing**, empresa de roofing en Texas. Incluye sitio público (EN/ES), cotizaciones, facturas, nómina, recibos de pago y medición de techos.

---

## Contenido

- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Requisitos previos](#-requisitos-previos)
- [Configuración](#-configuración)
- [Ejecución en local](#-ejecución-en-local)
- [Scripts útiles](#-scripts-útiles)
- [Despliegue](#-despliegue)
- [Recursos](#-recursos)

---

## Stack tecnológico

| Capa        | Tecnología |
|------------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Heroicons |
| **Backend**  | NestJS 11, TypeScript, Prisma |
| **Base de datos** | PostgreSQL |
| **Email**   | Resend |
| **Mapas / medición** | Google Maps JS API, Mapbox GL (dibujo de polígonos) |
| **PDF**     | PDFKit (facturas en backend) |

---

## Estructura del proyecto

```
BoysRoofing/
├── Frontend-BoysRoofing/     # Next.js – sitio público + panel admin
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Páginas públicas EN/ES (home, servicios, contacto, cotización, galería)
│   │   │   └── (admin)/      # Panel admin EN/ES (login, dashboard, cotizaciones, facturas, etc.)
│   │   ├── components/
│   │   └── lib/
│   └── public/
├── Backend-BoysRoofing/      # NestJS – API REST
│   ├── src/
│   │   ├── auth/            # Login admin, JWT
│   │   ├── quotes/          # Cotizaciones, notificación por email
│   │   ├── invoices/        # Facturas, PDF, envío por email
│   │   ├── mail/            # Resend (cotizaciones, facturas, recibos)
│   │   ├── Reviews/         # Reseñas por cotización
│   │   ├── workers/         # Trabajadores (nómina)
│   │   ├── payroll/        # Períodos, entradas, días trabajados
│   │   └── receipts/       # Envío de recibos de pago por email
│   └── prisma/              # Schema y migraciones
└── README.md
```

---

## Funcionalidades

### Sitio público (EN / ES)

- **Inicio:** hero, servicios, valores, reseñas.
- **Servicios, Nosotros, Contacto:** páginas informativas.
- **Cotización:** formulario que envía al backend y notifica por email al admin.
- **Galería:** galería de imágenes.

### Panel de administración (EN / ES)

Acceso: `/admin/en/login` o `/admin/es/login`. El resto de rutas requieren sesión (JWT).

| Sección | Descripción |
|--------|-------------|
| **Dashboard** | Resumen del panel. |
| **Cotizaciones** | Listado y detalle de cotizaciones; estados (PENDING, IN_REVIEW, SENT, CLOSED). |
| **Crear factura** | Crear factura asociada a una cotización; genera PDF y envía por email al cliente. |
| **Medir** | Herramienta de medición de techos con mapa (polígonos, área). |
| **Trabajadores** | CRUD de trabajadores; tarifa por día, saldo/balance. |
| **Nómina** | Períodos de pago, entradas por trabajador (días completos/medios, bonos, deducciones), marcar pagado, círculo de días. |
| **Balances / Deudas** | Resumen de balances por trabajador. |
| **Recibos de pago** | Crear recibos (cliente, monto, concepto, fecha), ver/imprimir (con logo), enviar por email al cliente. Concepto “Otro” con campo de texto libre. |

### Backend (API)

- **Auth:** `POST /auth/login` (email + password), JWT.
- **Quotes:** listado, detalle, actualizar estado; envío de email al recibir nueva cotización.
- **Invoices:** crear factura, generar PDF, enviar por email con Resend.
- **Reviews:** verificación de elegibilidad y creación de reseñas por cotización.
- **Workers:** CRUD de trabajadores.
- **Payroll:** períodos, entradas, días trabajados, marcar pagado.
- **Receipts:** `POST /receipts/send-email` para enviar recibo de pago por email (con logo y texto “Visita” en el pie).

Los **recibos de pago** se guardan en la base de datos (tabla `PaymentReceipt`), por lo que se sincronizan entre todos los dispositivos; el backend también envía el email del recibo.

---

## Requisitos previos

- **Node.js** 18+ (recomendado 20+)
- **npm** o **pnpm**
- **PostgreSQL** (local o servicio remoto)
- Cuenta en **Resend** (API key para emails)
- **Google Maps API key** (opcional; solo para la herramienta Medir)

---

## Configuración

### Backend (`Backend-BoysRoofing`)

Crea `.env` en la raíz del backend con:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="tu_secreto_jwt_largo_y_seguro"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="tu_password_seguro"
RESEND_API_KEY="re_xxxx"
MAIL_FROM="noreply@tudominio.com"
MAIL_TO="admin@tudominio.com"
PORT=3200
FRONTEND_ORIGIN="http://localhost:3000"
```

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: login del panel admin (el primer login puede crear el usuario si no existe).
- `MAIL_FROM`: remitente de los emails (debe estar verificado en Resend).
- `MAIL_TO`: destinatario de las notificaciones de nuevas cotizaciones.

### Frontend (`Frontend-BoysRoofing`)

Crea `.env.local` en la raíz del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3200
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
```

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: solo necesario para la sección **Medir** (mapa y dibujo de polígonos).

---

## Ejecución en local

### 1. Base de datos

Asegúrate de que PostgreSQL esté en marcha y que `DATABASE_URL` en el backend apunte a tu base. Luego:

```bash
cd Backend-BoysRoofing
npm install
npx prisma migrate deploy
# o, en desarrollo: npx prisma generate
```

### 2. Backend

```bash
cd Backend-BoysRoofing
npm run start:dev
```

Por defecto corre en **http://localhost:3200**.

### 3. Frontend

```bash
cd Frontend-BoysRoofing
npm install
npm run dev
```

Abre **http://localhost:3000**.  
Para el panel: **http://localhost:3000/admin/en/login** o **/admin/es/login**.

---

## Scripts útiles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con watch |
| `npm run build` | Compilar |
| `npm run start:prod` | Producción (ejecuta migraciones y arranca) |
| `npx prisma migrate dev` | Crear y aplicar migraciones en desarrollo |
| `npx prisma studio` | Abrir Prisma Studio |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |

---

## Despliegue

- **Frontend:** preparado para Vercel u otro host de Next.js. Configura `NEXT_PUBLIC_API_URL` con la URL del backend en producción.
- **Backend:** típicamente en Railway, Render, Fly.io o VPS. Configura `DATABASE_URL`, `JWT_SECRET`, `RESEND_*`, `MAIL_*`, `ADMIN_*` y `FRONTEND_ORIGIN` con la URL del frontend.
- **Recibos por email:** el pie del correo muestra “Visita https://www.boysroofing.company/en”; la URL del logo en el email se construye con el origen del frontend.

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Resend](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Licencia

Uso interno / privado. NestJS (backend) bajo licencia MIT.
