# Ascencio Tax Inc. API

API REST para el sistema de gestión de citas, clientes y servicios de Ascencio Tax Inc. Construida con NestJS, PostgreSQL, y múltiples integraciones de terceros (Google Calendar, Zoom, Cloudinary, OpenAI).

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución en Desarrollo](#-ejecución-en-desarrollo)
- [Base de Datos](#-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Integraciones](#-integraciones)
- [Seguridad](#-seguridad)
- [Producción](#-producción)

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **[Node.js 20.x o superior](https://nodejs.org/)** - Runtime de JavaScript
- **[Yarn](https://yarnpkg.com/)** - Gestor de paquetes
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** - Para ejecutar PostgreSQL en contenedor
- **[NestJS CLI](https://docs.nestjs.com/cli/overview)** - Herramienta de línea de comandos

### Instalación de NestJS CLI

```bash
# Windows (ejecutar como administrador)
npm install -g @nestjs/cli

# Linux / macOS
sudo npm install -g @nestjs/cli
```

> **Nota:** En Windows es necesario ejecutar la terminal como administrador. En Linux/Mac usar `sudo`.

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ayunierto/ascenciotaxincapi.git
cd ascenciotaxincapi
```

### 2. Instalar dependencias

```bash
yarn install
```

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env

# Windows (CMD)
copy .env.example .env
```

### 2. Configurar Variables Requeridas

Edita el archivo `.env` y configura al menos las siguientes variables:

#### **Configuración del Servidor**

```env
PORT=3000
STAGE=dev
```

#### **Base de Datos**

```env
DB_URL=postgresql://postgres:tu_password_seguro@localhost:5432/ascencio_tax_db
DB_PASSWORD=tu_password_seguro
DB_NAME=ascencio_tax_db
```

#### **JWT (Authentication)**

```env
# Genera una clave segura con:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=tu_secreto_jwt_de_minimo_32_caracteres
JWT_EXPIRY=60m
```

#### **Email (Gmail con App Password)**

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
SENDER_NAME="Ascencio Tax Inc."
```

> **Importante:** Usa un App Password de Gmail, no tu contraseña normal.
> [Crear App Password](https://support.google.com/accounts/answer/185833)

#### **Configuración de Negocio**

```env
SLOT_STEP_MINUTES_DEFAULT=15
BUSINESS_TZ=America/Toronto
EMAIL_VERIFICATION_EXPIRY=15
```

### 3. Configurar Servicios Externos (Opcional)

#### **Cloudinary** (almacenamiento de archivos)

1. Crear cuenta en [Cloudinary](https://console.cloudinary.com/)
2. Obtener credenciales en el dashboard
3. Configurar en `.env`:

```env
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

#### **Google Calendar API**

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar Google Calendar API
4. Crear Service Account en "IAM y Administración > Cuentas de servicio"
5. Descargar el archivo JSON de credenciales
6. Compartir tu calendario de Google con el email del Service Account (dar permisos de edición)
7. Configurar en `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=tu_calendar_id@group.calendar.google.com
```

#### **Zoom API**

1. Ir a [Zoom Marketplace](https://marketplace.zoom.us/)
2. Crear una app "Server-to-Server OAuth"
3. Obtener credenciales
4. Configurar en `.env`:

```env
ZOOM_ACCOUNT_ID=tu_account_id
ZOOM_CLIENT_ID=tu_client_id
ZOOM_CLIENT_SECRET=tu_client_secret
```

#### **OpenAI API**

1. Crear cuenta en [OpenAI Platform](https://platform.openai.com/)
2. Generar API Key
3. Configurar en `.env`:

```env
OPENAI_API_KEY=sk-proj-TU_API_KEY_AQUI
```

## 💾 Base de Datos

### Iniciar PostgreSQL con Docker

```bash
# Iniciar contenedor en segundo plano
docker-compose up -d

# Ver logs del contenedor
docker-compose logs -f

# Detener contenedor
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

### Ejecutar Seed (Datos de Prueba)

Una vez que la aplicación esté corriendo:

```bash
# Opción 1: Mediante endpoint
curl http://localhost:3000/api/seed

# Opción 2: Abrir en navegador
http://localhost:3000/api/seed
```

## 🏃 Ejecución en Desarrollo

### Modo de Desarrollo (con hot-reload)

```bash
# Iniciar en modo watch (recomendado para desarrollo)
yarn start:dev

# La API estará disponible en:
# http://localhost:3000
```

### Otros Modos de Ejecución

```bash
# Modo desarrollo (sin watch)
yarn start

# Modo debug (con inspector de Node.js)
yarn start:debug

# Modo producción
yarn build
yarn start:prod
```

## 📁 Estructura del Proyecto

```
ascencio-tax-inc-api/
├── src/
│   ├── auth/              # Módulo de autenticación
│   ├── users/             # Módulo de usuarios
│   ├── appointments/      # Módulo de citas
│   ├── calendar/          # Integración Google Calendar
│   ├── zoom/              # Integración Zoom
│   ├── email/             # Servicio de emails
│   ├── cloudinary/        # Servicio de almacenamiento
│   ├── common/            # Utilidades comunes
│   ├── config/            # Configuración de la app
│   └── main.ts            # Punto de entrada
├── .env                   # Variables de entorno (NO COMMITEAR)
├── .env.example           # Plantilla de variables
├── docker-compose.yml     # Configuración de Docker
├── package.json           # Dependencias del proyecto
└── README.md              # Este archivo
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
yarn start:dev          # Iniciar con hot-reload
yarn start:debug        # Iniciar con debugger

# Testing
yarn test               # Ejecutar tests unitarios
yarn test:watch         # Tests en modo watch
yarn test:cov           # Tests con cobertura
yarn test:e2e           # Tests end-to-end

# Build
yarn build              # Compilar para producción
yarn start:prod         # Ejecutar build de producción

# Linting
yarn lint               # Verificar código
yarn format             # Formatear código con Prettier
```

## 🔗 Integraciones

Este proyecto integra los siguientes servicios:

| Servicio                | Propósito                       | Documentación                                           |
| ----------------------- | ------------------------------- | ------------------------------------------------------- |
| **PostgreSQL**          | Base de datos relacional        | [Docs](https://www.postgresql.org/docs/)                |
| **Google Calendar API** | Gestión de citas y eventos      | [Docs](https://developers.google.com/calendar)          |
| **Zoom API**            | Creación de reuniones virtuales | [Docs](https://marketplace.zoom.us/docs/api-reference/) |
| **Cloudinary**          | Almacenamiento de archivos      | [Docs](https://cloudinary.com/documentation)            |
| **OpenAI API**          | Inteligencia artificial         | [Docs](https://platform.openai.com/docs)                |
| **Nodemailer**          | Envío de emails                 | [Docs](https://nodemailer.com/)                         |

## 🔒 Seguridad

### Mejores Prácticas

1. **NUNCA** commites el archivo `.env` al repositorio
2. Usa contraseñas fuertes y únicas para cada servicio
3. Rota las credenciales regularmente, especialmente en producción
4. Usa App Passwords para Gmail, no tu contraseña principal
5. Genera un JWT_SECRET aleatorio de al menos 32 caracteres
6. Mantén actualizadas las dependencias:
   ```bash
   yarn upgrade-interactive --latest
   ```

### Generar Secreto JWT Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variables de Entorno por Ambiente

Para diferentes ambientes, crea archivos separados:

```
.env.development
.env.production
.env.test
```

Y carga el apropiado según el ambiente.

## 🚀 Producción

### Preparar para Producción

1. **Configurar variables de producción** en `.env` o usar un gestor de secretos
2. **Compilar el proyecto:**
   ```bash
   yarn build
   ```
3. **Ejecutar en modo producción:**
   ```bash
   yarn start:prod
   ```

### Recomendaciones para Deploy

- Usa servicios como **AWS Secrets Manager**, **Azure Key Vault**, o **Google Secret Manager** para gestionar secretos
- Configura variables de entorno en tu plataforma de hosting (Railway, Heroku, AWS, etc.)
- Usa **PM2** o similar para process management
- Implementa rate limiting y CORS apropiadamente
- Configura logs estructurados
- Habilita HTTPS/SSL

## 📝 Notas Adicionales

- La API usa autenticación JWT via Bearer Token
- Los endpoints están documentados con Swagger (si está habilitado)
- El timezone por defecto es `America/Toronto` pero se puede cambiar en `.env`
- Los slots de citas por defecto son de 15 minutos

## 🆘 Troubleshooting

### Error al conectar con la base de datos

- Verifica que Docker esté corriendo: `docker ps`
- Revisa los logs: `docker-compose logs`
- Verifica las credenciales en `.env`

### Error de autenticación con Google Calendar

- Verifica que el Service Account tenga acceso al calendario
- Asegúrate de mantener los `\n` en la GOOGLE_PRIVATE_KEY
- Verifica que la API de Google Calendar esté habilitada en tu proyecto

### Puerto ya en uso

- Cambia el `PORT` en `.env`
- O mata el proceso que usa el puerto:

  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Linux/Mac
  lsof -ti:3000 | xargs kill
  ```

---

**Desarrollado con ❤️ para Ascencio Tax Inc.**
