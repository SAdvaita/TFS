# TRUE FIRE SOLUTION (TFS)

<div align="center">

![TFS](https://img.shields.io/badge/TFS-Business%20Management-ff3b30?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)

</div>

Business management and invoicing platform for TRUE FIRE SOLUTION with web and Android support.

## Overview
This project centralizes customer records, product catalog management, license tracking, delivery challans, quotations, audit logs, and invoice generation in a format that closely matches the official TFS document layout.

## Features
- Exact invoice and quotation document generation with print-ready layout
- Customer master management and invoice history
- Product catalog with refill and new pricing
- License vault with expiry tracking
- Delivery challan and fire drill report modules
- Excel export/import support
- Immutable audit history for operational tracking
- React web app and React Native mobile app connected to the same backend

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Mobile: Expo / React Native
- Backend: Node.js + Express + TypeScript
- Database: SQLite via Prisma ORM

## Prerequisites
Before you begin, make sure you have:
- Node.js 18+ or 20+
- npm
- Git
- Android Studio + emulator for mobile testing (optional)

## Quick Start

### 1) Clone the repository
```bash
git clone https://github.com/SAdvaita/TFS.git
cd TFS
```

### 2) Install dependencies
```bash
cd backend
npm install

cd ../web
npm install

cd ../mobile
npm install
```

### 3) Configure environment variables
Copy the example environment files before starting the app:

```bash
cd backend
copy .env.example .env

cd ../web
copy .env.example .env
```

Update the values in each `.env` file as needed.

Example backend values:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="change_this_to_a_secure_secret"
```

Example web values:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4) Initialize the database
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

### 5) Start the application
#### Backend
```bash
cd backend
npm run dev
```

#### Web app
```bash
cd web
npm run dev
```

Open http://localhost:5173 in the browser.

#### Mobile app
```bash
cd mobile
npm start
```

Then run the app in an emulator or Expo Go.

## Default Login
- Email: admin@truefiresolution.com
- Password: admin123

## One-click startup
The project root includes a Windows launcher:

```bash
start.bat
```

## Project Structure
```text
TFS/
├─ backend/
│  ├─ prisma/
│  ├─ src/
│  ├─ .env.example
│  └─ package.json
├─ web/
│  ├─ src/
│  ├─ .env.example
│  └─ package.json
├─ mobile/
│  ├─ src/
│  └─ package.json
├─ assets/
├─ README.md
├─ start.bat
└─ .gitignore
```

## Notes
- The backend serves uploaded files from the `uploads` directory and assets from the `assets` folder.
- `mobile/src/api/client.ts` defaults to the Android emulator endpoint `http://10.0.2.2:5000/api`.
- For real device testing, update the API URL in the mobile app settings or client configuration.

## License
This project is intended for the TRUE FIRE SOLUTION business workflow and internal operational use.
