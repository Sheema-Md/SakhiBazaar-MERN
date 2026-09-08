# Sakhi Bazaar

Sakhi Bazaar is a MERN marketplace for women entrepreneurs. It supports customer shopping, seller stores, product management, orders, payments, notifications, chat, and a separate admin dashboard.

## Project Structure

| Directory | Purpose | Default port |
| --- | --- | ---: |
| `frontend/` | Customer and seller React app | 5173 |
| `backend/` | Main Express API and Socket.io server | 5000 |
| `admin/frontend/` | Admin React dashboard | 5174 |
| `admin/backend/` | Admin Express API | 5001 |

## Requirements

- Node.js 18 or newer
- MongoDB or MongoDB Atlas
- Firebase project for Google Authentication
- Cloudinary account for image uploads
- Stripe account for payments

## Local Setup

Install dependencies in each application:

```powershell
cd backend; npm install
cd ../frontend; npm install
cd ../admin/backend; npm install
cd ../frontend; npm install
```

Create environment files from the templates before starting the applications:

```text
backend/.env.example       -> backend/.env
frontend/.env.example      -> frontend/.env
admin/backend/.env.example -> admin/backend/.env
admin/frontend/.env.example -> admin/frontend/.env
```

Fill in real local values. Never commit `.env` files, passwords, tokens, or API keys.

Start each application in a separate terminal:

```powershell
cd backend; npm run dev
cd frontend; npm run dev
cd admin/backend; npm run dev
cd admin/frontend; npm run dev
```

When using the Vite development proxy, set `VITE_DEV_API_TARGET` and `VITE_DEV_ADMIN_API_TARGET` in the frontend environment files.

## Production Deployment

Recommended services:

- Customer frontend: Vercel, root directory `frontend`
- Admin frontend: Vercel, root directory `admin/frontend`
- Main API: Render Web Service, root directory `backend`
- Admin API: Render Web Service, root directory `admin/backend`
- Database: MongoDB Atlas
- File storage: Cloudinary

Frontend build command:

```text
npm run build
```

Backend start command:

```text
npm start
```

Set production environment variables in Vercel and Render from the appropriate `.env.example` file. Use deployed HTTPS URLs for `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_ADMIN_APP_URL`, and `CORS_ORIGINS`.

The main API health check is:

```text
GET https://your-api-domain/api/health
```

## Main Features

- Customer registration, login, Google authentication, cart, checkout, orders, returns, and refunds
- Seller registration, approval, product creation, image uploads, inventory, and order management
- Admin user, seller, product, and order management
- JWT-protected APIs with role-based authorization
- Firebase Google Authentication
- Socket.io chat and notifications
- Stripe payments and webhooks
- Cloudinary image storage
- AI and market-price features

## Pre-Release Checklist

- Verify MongoDB Atlas connectivity.
- Confirm production CORS origins.
- Test customer, seller, and admin authorization.
- Test login, logout, Google login, and session expiry.
- Test image uploads, checkout, Stripe webhooks, orders, refunds, notifications, and chat.
- Run both frontend production builds.
- Confirm no `.env`, `node_modules`, `dist`, logs, uploads, or temporary files are tracked.

## Repository Safety

Use the committed `.env.example` files as templates only. Store real secrets in the hosting provider's environment settings. Before pushing, run:

```powershell
git status --short
git ls-files | Select-String -Pattern '(^|/)(\.env($|\.)|node_modules/|dist/|build/|.*\.log$)'
```

The second command should return no secret or generated files.
