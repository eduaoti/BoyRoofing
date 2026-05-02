# Boy's Roofing

Sitio web corporativo y panel de administración para **Boy's Roofing**, empresa de roofing en Texas. Incluye sitio público (EN/ES), mapa de zona de servicio con proyectos, reseñas (carrusel y enlaces por proyecto), cotizaciones, facturas, nómina, recibos de pago y medición de techos con informe en PDF.

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
- [Producción y vista previa](#-producción-y-vista-previa)
- [Recursos](#-recursos)

---

## Stack tecnológico

| Capa        | Tecnología |
|------------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Heroicons, Swiper |
| **Backend**  | NestJS 11, TypeScript, Prisma |
| **Base de datos** | PostgreSQL |
| **Email**   | Resend |
| **Mapas**   | Mapbox GL (Golden Triangle en la home, herramienta **Medir**, panel **Proyectos**; dibujo de polígonos con `@mapbox/mapbox-gl-draw`) |
| **PDF**     | PDFKit (facturas e informes de medición de techo en backend) |

---

## Estructura del proyecto

```
BoysRoofing/
├── Frontend-BoysRoofing/     # Next.js – sitio público + panel admin
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/     # Páginas EN/ES (home, servicios, nosotros, contacto, cotización, galería, review por token)
│   │   │   ├── (admin)/      # Panel admin EN/ES
│   │   │   └── api/translate # Proxy de traducción (MyMemory) para reseñas en mapa EN
│   │   ├── components/       # Hero, HomePage, GoldenTriangleMap, ReviewsCarousel, Measure (Mapbox), etc.
│   │   ├── contexts/         # Imágenes del sitio (Cloudinary + defaults)
│   │   ├── locales/        # en.json / es.json
│   │   └── lib/
│   └── public/
├── Backend-BoysRoofing/      # NestJS – API REST
│   ├── src/
│   │   ├── auth/            # Login admin, JWT
│   │   ├── quotes/          # Cotizaciones, notificación por email
│   │   ├── invoices/      # Facturas, PDF, envío por email
│   │   ├── mail/            # Resend
│   │   ├── Reviews/         # Reseñas ligadas a cotización (flujo clásico)
│   │   ├── projects/        # Proyectos en mapa, reseñas por token, subida de foto, aprobación
│   │   ├── workers/         # Trabajadores (nómina)
│   │   ├── payroll/       # Períodos, entradas, días trabajados
│   │   ├── receipts/       # Recibos de pago por email
│   │   ├── roof-detection/ # Detección asistida de contorno de techo (Mapbox Static API, JWT)
│   │   ├── roof-report/    # Generación de PDF de informe de medición (JWT)
│   │   └── site-images/    # Imágenes editables del sitio (Cloudinary)
│   └── prisma/
└── README.md
```

---

## Funcionalidades

### Sitio público (EN / ES)

- **Inicio:** hero (imagen configurable), beneficios, bloque “nosotros” con imagen desde el panel, servicios destacados, misión / visión / valores, CTA a contacto. Animaciones al hacer scroll (`useReveal`).
- **Mapa Golden Triangle:** sección con mapa Mapbox del área Beaumont–Port Arthur–Orange; muestra proyectos publicados desde el admin. En inglés, nombres y comentarios de reseñas del mapa se traducen vía `/api/translate`.
- **Reseñas:** carrusel (Swiper) con reseñas aprobadas de proyectos; incluye reseñas por defecto si no hay datos. Modal para dejar reseña vinculada a cotización (flujo existente con email).
- **Servicios, Nosotros, Contacto, Cotización, Galería:** páginas informativas; **Servicios** incluye comparativas antes/después y carrusel de trabajos alimentado por las mismas claves de imágenes del sitio (`service_*`, `carousel_*`).
- **Dejar reseña por proyecto:** ruta `/review/[token]` (compartida EN/ES): el cliente envía mensaje, valoración y opcionalmente foto; el admin aprueba para que aparezca en el sitio.

### Panel de administración (EN / ES)

Acceso: `/admin/en/login` o `/admin/es/login`. El resto de rutas requieren sesión (JWT).

| Sección | Descripción |
|--------|-------------|
| **Dashboard** | Resumen del panel. |
| **Cotizaciones** | Listado y detalle; estados (PENDING, IN_REVIEW, SENT, CLOSED). |
| **Crear factura** | Factura asociada a cotización; PDF y envío por email. |
| **Medir** | Mapa satélite Mapbox: búsqueda por dirección, dibujo de polígono, cálculo de área / perímetro / squares, resumen de roofing (pitch, desperdicio). **Detectar techo:** sugiere contorno vía backend. **Descargar informe:** PDF generado en el backend. |
| **Trabajadores** | CRUD; tarifa por día, saldo. |
| **Nómina** | Períodos, entradas, días completos/medios, bonos, deducciones, marcar pagado. |
| **Balances / Deudas** | Resumen por trabajador. |
| **Recibos de pago** | Crear, ver/imprimir, enviar por email (concepto “Otro” con texto libre). |
| **Imágenes del sitio** | Hero, about, fundador/equipo, antes/después de servicios, carrusel (carousel_1…5), logo. Subida a Cloudinary. |
| **Proyectos / Map** | CRUD de proyectos (nombre, coordenadas, logo); geocodificación Mapbox en el panel. Gestión de reseñas recibidas por token (aprobar / eliminar). |

### Backend (API)

- **Auth:** `POST /auth/login`, JWT.
- **Quotes / Invoices / Reviews (cotización):** como antes; reseñas ligadas a `Quote`.
- **Projects (público):** `GET /projects/map`, `GET /projects/reviews`, `GET /projects/review/:token`, `POST /projects/review/:token`, `POST /projects/review/:token/upload-photo`.
- **Projects (admin, JWT):** CRUD, `POST /projects/upload-logo`, listado y moderación de reseñas de proyecto.
- **Roof detection (JWT):** `POST /roof-detection/detect` — requiere `MAPBOX_TOKEN` o `NEXT_PUBLIC_MAPBOX_TOKEN` en el servidor para imágenes estáticas.
- **Roof report (JWT):** `POST /roof-report/pdf` — PDF del informe de medición.
- **Site images:** `GET /site-images` (público); `PATCH` / `POST .../upload` (admin).
- **Recibos:** persistencia en `PaymentReceipt` y envío por email.

Los **proyectos en mapa** y sus **reseñas** (`ProjectReview` / `MapProject`) son independientes del modelo `Review` por cotización; ambos conviven en el producto.

---

## Requisitos previos

- **Node.js** 18+ (recomendado 20+)
- **npm** o **pnpm**
- **PostgreSQL**
- Cuenta en **Resend**
- **Mapbox:** token público (`pk.`) en el frontend; para detección de techo en servidor, también `MAPBOX_TOKEN` (o reutilizar la variable que ya uses) en el backend
- **Cloudinary** (imágenes del sitio y logos de proyecto en el admin)

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

# Cloudinary (imágenes del sitio y logos de proyectos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Detección de techo (imágenes Mapbox en servidor; puede ser el mismo token pk. con permisos adecuados)
MAPBOX_TOKEN=tu_token_mapbox
```

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: login del panel.
- `CLOUDINARY_*`: necesarios para subidas desde el admin.
- `MAPBOX_TOKEN`: obligatorio para `POST /roof-detection/detect` (el servicio también acepta `NEXT_PUBLIC_MAPBOX_TOKEN` si está definida en el mismo entorno).

### Frontend (`Frontend-BoysRoofing`)

Crea `.env.local` en la raíz del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3200
NEXT_PUBLIC_MAPBOX_TOKEN=pk.tu_token_publico_mapbox
```

- `NEXT_PUBLIC_MAPBOX_TOKEN`: necesario para el mapa Golden Triangle, la página **Medir**, el panel **Proyectos / Map** (geocodificación y vista de mapa). Debe ser el token **público** (`pk.`), no el secreto (`sk.`).

---

## Ejecución en local

### 1. Base de datos

Asegúrate de que PostgreSQL esté en marcha y que `DATABASE_URL` apunte a tu base. Luego:

```bash
cd Backend-BoysRoofing
npm install
npx prisma migrate deploy
# o, en desarrollo: npx prisma migrate dev
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
Panel: **http://localhost:3000/admin/en/login** o **/admin/es/login**.

---

## Scripts útiles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con watch |
| `npm run build` | Compilar |
| `npm run start:prod` | Producción (migraciones + arranque) |
| `npx prisma migrate dev` | Migraciones en desarrollo |
| `npx prisma studio` | Prisma Studio |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |

---

## Despliegue

- **Frontend:** Vercel u otro host Next.js. En producción, `NEXT_PUBLIC_API_URL` debe apuntar al API público (p. ej. `https://api.boysroofing.company`) y `NEXT_PUBLIC_MAPBOX_TOKEN` debe tener restricciones de URL acordes a tu dominio.
- **Backend:** Railway, Render, Fly.io o VPS. Incluye `DATABASE_URL`, `JWT_SECRET`, Resend, `ADMIN_*`, `FRONTEND_ORIGIN` (URL canónica del sitio, p. ej. `https://www.boysroofing.company`), Cloudinary y `MAPBOX_TOKEN` si usas detección de techo.
- **Recibos y emails:** enlaces al sitio en plantillas usan `https://www.boysroofing.company` (EN/ES según locale); mantén `FRONTEND_ORIGIN` y el dominio en Resend alineados con esa URL.

---

## Producción y vista previa

Referencias tomadas del dominio y variables usadas en el repo (`Frontend-BoysRoofing/.env`, componentes de recibo y correo).

| Recurso | URL |
|--------|-----|
| **Sitio (raíz)** | [https://www.boysroofing.company](https://www.boysroofing.company) |
| **Home EN** | [https://www.boysroofing.company/en](https://www.boysroofing.company/en) |
| **Home ES** | [https://www.boysroofing.company/es](https://www.boysroofing.company/es) |
| **API (REST)** | `https://api.boysroofing.company` |
| **Admin EN** | [https://www.boysroofing.company/admin/en/login](https://www.boysroofing.company/admin/en/login) |
| **Admin ES** | [https://www.boysroofing.company/admin/es/login](https://www.boysroofing.company/admin/es/login) |

Los enlaces anteriores sirven como **vista previa en vivo** del hero, mapa Golden Triangle, carrusel de reseñas y el resto de secciones públicas.

### Capturas para el README (opcional)

Si quieres ilustrar la documentación con imágenes, guarda PNG o WebP en [`docs/screenshots/`](docs/screenshots/) con nombres claros y enlázalas aquí. Por ejemplo:

| Archivo sugerido | Contenido |
|------------------|-----------|
| `home-hero-en.png` | Hero completo (EN) |
| `home-golden-triangle.png` | Sección mapa + marcadores |
| `home-reviews.png` | Carrusel de reseñas |
| `services-before-after.png` | Bloque antes/después en servicios |
| `admin-measure.png` | Herramienta Medir (admin) |

Ejemplo de sintaxis en Markdown cuando el archivo exista:

```markdown
![Home — Golden Triangle](docs/screenshots/home-golden-triangle.png)
```

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Resend](https://resend.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Licencia

Uso interno / privado. NestJS (backend) bajo licencia MIT.
