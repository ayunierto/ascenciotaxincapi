# Ascencio Tax Inc. API

REST API for Ascencio Tax Inc.'s appointment, client, and service management system. Built with NestJS, PostgreSQL, and multiple third-party integrations (Google Calendar, Zoom, Cloudinary, OpenAI).

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running in Development](#-running-in-development)
- [Database](#-database)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Integrations](#-integrations)
- [Security](#-security)
- [Production](#-production)

## 🔧 Prerequisites

Before starting, make sure you have installed:

- **[Node.js 20.x or higher](https://nodejs.org/)** - JavaScript runtime
- **[Yarn](https://yarnpkg.com/)** - Package manager
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** - To run PostgreSQL in a container
- **[NestJS CLI](https://docs.nestjs.com/cli/overview)** - Command line interface tool

### Installing NestJS CLI

```bash
# Windows (run as administrator)
npm install -g @nestjs/cli

# Linux / macOS
sudo npm install -g @nestjs/cli
```

> **Note:** On Windows, it's necessary to run the terminal as administrator. On Linux/Mac use `sudo`.

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/ayunierto/ascenciotaxincapi.git
cd ascenciotaxincapi
```

### 2. Install dependencies

```bash
yarn install
```

## ⚙️ Configuration

### 1. Setup Environment Variables

Copy the example file and configure your credentials:

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env

# Windows (CMD)
copy .env.example .env
```

### 2. Configure Required Variables

Edit the `.env` file and configure at least the following variables:

#### **Server Configuration**

```env
PORT=3000
STAGE=dev
```

#### **Database**

```env
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

#### **JWT (Authentication)**

```env
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRY=60m
```

#### **Email (Gmail with App Password)**

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
SENDER_NAME="Ascencio Tax Inc."
ENTERPRISE_EMAIL=your_enterprise_notification_email@example.com
```

#### **MailerSend (Transactional Email)**

```env
MAILERSEND_API_KEY=mlsn.YOUR_MAILERSEND_API_KEY_HERE
MAILERSEND_SENDER_EMAIL=support@yourdomain.com
MAILERSEND_SENDER_EMAIL_REPLY_TO=team@yourdomain.com
MAILERSEND_SENDER_NAME="Your Company Name"
```

#### **Business Configuration**

```env
SLOT_STEP_MINUTES_DEFAULT=15
BUSINESS_TZ=America/Toronto
EMAIL_VERIFICATION_EXPIRY=15
```

#### **Cloudinary** (file storage)

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### **Google Calendar API**

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```

#### **Zoom API**

```env
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

#### **OpenAI API**

```env
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE
```

## 💾 Database

### Start PostgreSQL with Docker

```bash
# Start container in detached mode
docker-compose up -d

# View container logs
docker-compose logs -f

# Stop container
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Run Seed (Test Data)

Once the application is running:

```bash
# Option 1: Via endpoint
curl http://localhost:3000/api/seed

# Option 2: Open in browser
http://localhost:3000/api/seed
```

## 🏃 Running in Development

### Development Mode (with hot-reload)

```bash
# Start in watch mode (recommended for development)
yarn start:dev

# The API will be available at:
# http://localhost:3000
```

### Other Execution Modes

```bash
# Development mode (without watch)
yarn start

# Debug mode (with Node.js inspector)
yarn start:debug

# Production mode
yarn build
yarn start:prod
```

## 📁 Project Structure

```
ascencio-tax-inc-api/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # Users module
│   ├── appointments/      # Appointments module
│   ├── calendar/          # Google Calendar integration
│   ├── zoom/              # Zoom integration
│   ├── email/             # Email service
│   ├── cloudinary/        # Storage service
│   ├── common/            # Common utilities
│   ├── config/            # App configuration
│   └── main.ts            # Entry point
├── .env                   # Environment variables (DO NOT COMMIT)
├── .env.example           # Variables template
├── docker-compose.yml     # Docker configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## 📜 Available Scripts

```bash
# Development
yarn start:dev          # Start with hot-reload
yarn start:debug        # Start with debugger

# Testing
yarn test               # Run unit tests
yarn test:watch         # Tests in watch mode
yarn test:cov           # Tests with coverage
yarn test:e2e           # End-to-end tests

# Build
yarn build              # Build for production
yarn start:prod         # Run production build

# Linting
yarn lint               # Check code
yarn format             # Format code with Prettier
```

## 🔗 Integrations

This project integrates the following services:

| Service                 | Purpose                          | Documentation                                           |
| ----------------------- | -------------------------------- | ------------------------------------------------------- |
| **PostgreSQL**          | Relational database              | [Docs](https://www.postgresql.org/docs/)                |
| **Google Calendar API** | Appointment and event management | [Docs](https://developers.google.com/calendar)          |
| **Zoom API**            | Virtual meeting creation         | [Docs](https://marketplace.zoom.us/docs/api-reference/) |
| **Cloudinary**          | File storage                     | [Docs](https://cloudinary.com/documentation)            |
| **OpenAI API**          | Artificial intelligence          | [Docs](https://platform.openai.com/docs)                |
| **Nodemailer**          | Email sending                    | [Docs](https://nodemailer.com/)                         |

## 🔒 Security

### Best Practices

1. **NEVER** commit the `.env` file to the repository
2. Use strong and unique passwords for each service
3. Rotate credentials regularly, especially in production
4. Use App Passwords for Gmail, not your main password
5. Generate a random JWT_SECRET of at least 32 characters
6. Keep dependencies up to date:
   ```bash
   yarn upgrade-interactive --latest
   ```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variables per Environment

For different environments, create separate files:

```
.env.development
.env.production
.env.test
```

And load the appropriate one based on the environment.

## 🚀 Production

### Preparing for Production

1. **Configure production variables** in `.env` or use a secrets manager
2. **Build the project:**
   ```bash
   yarn build
   ```
3. **Run in production mode:**
   ```bash
   yarn start:prod
   ```

### Deployment Recommendations

- Use services like **AWS Secrets Manager**, **Azure Key Vault**, or **Google Secret Manager** to manage secrets
- Configure environment variables in your hosting platform (Railway, Heroku, AWS, etc.)
- Use **PM2** or similar for process management
- Implement rate limiting and CORS appropriately
- Configure structured logging
- Enable HTTPS/SSL

## 📝 Additional Notes

- The API uses JWT authentication via Bearer Token
- Endpoints are documented with Swagger (if enabled)
- The default timezone is `America/Toronto` but can be changed in `.env`
- Default appointment slots are 15 minutes

## 🆘 Troubleshooting

### Database connection error

- Verify Docker is running: `docker ps`
- Check the logs: `docker-compose logs`
- Verify credentials in `.env`

### Google Calendar authentication error

- Verify the Service Account has access to the calendar
- Make sure to keep the `\n` in GOOGLE_PRIVATE_KEY
- Verify that Google Calendar API is enabled in your project

### Port already in use

- Change the `PORT` in `.env`
- Or kill the process using the port:

  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Linux/Mac
  lsof -ti:3000 | xargs kill
  ```

---

**Developed with ❤️ for Ascencio Tax Inc.**
