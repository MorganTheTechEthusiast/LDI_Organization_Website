# Liberia Digital Insights Website

A production-ready full-stack website for Liberia Digital Insights, a Liberian tech media organization focused on technology news, digital education, startup visibility, events, and community impact.

## Stack

- React, React Router, Tailwind CSS, Vite
- Node.js, Express.js
- SQLite
- JWT-based admin authentication

## Project Structure

```text
client/   React frontend and admin dashboard
server/   Express API, SQLite database, seed data
```

## Getting Started

Install dependencies:

```bash
npm install
```

Seed the SQLite database:

```bash
npm run seed
```

Run frontend and backend together:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5050/api`

Production frontend: `https://liberiadigitalinsights.up.railway.app`

Production backend API: `https://ldi-backend.up.railway.app/api`

Production backend health check: `https://ldi-backend.up.railway.app/api/health`

Railway frontend variable:

```text
VITE_API_URL=https://ldi-backend.up.railway.app/api
```

Railway backend variables:

```text
CLIENT_ORIGIN=https://liberiadigitalinsights.up.railway.app
DB_CLIENT=postgres
DATABASE_URL=your_railway_postgres_url
```

## Admin Login

```text
Email: admin@liberiadigitalinsights.org
Password: Admin@12345
```

## Useful Scripts

```bash
npm run dev       # Run client and server
npm run build     # Build frontend
npm run start     # Start Express server
npm run seed      # Reset and seed database
```

## API Overview

Public endpoints:

- `GET /api/blog-posts`
- `GET /api/blog-posts/:slug`
- `GET /api/events`
- `GET /api/team-members`
- `GET /api/gallery`
- `GET /api/partners`
- `POST /api/contact`
- `POST /api/auth/login`

Admin endpoints require a bearer token:

- `POST /api/blog-posts`
- `PUT /api/blog-posts/:id`
- `DELETE /api/blog-posts/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/team-members`
- `PUT /api/team-members/:id`
- `DELETE /api/team-members/:id`
- `POST /api/gallery`
- `PUT /api/gallery/:id`
- `DELETE /api/gallery/:id`
- `POST /api/partners`
- `PUT /api/partners/:id`
- `DELETE /api/partners/:id`
- `GET /api/contact-messages`
- `DELETE /api/contact-messages/:id`

## Notes

The app uses image URLs for content management, making it simple to deploy before adding a file upload provider. The database file is created at `server/data/ldi.sqlite`.
