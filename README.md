# Liberia Digital Insights Website

A production-ready full-stack website for Liberia Digital Insights, a Liberian tech media organization focused on technology news, digital education, startup visibility, events, and community impact.

## Stack

- React, React Router, Tailwind CSS, Vite
- Node.js, Express.js
- SQLite or PostgreSQL, selected through environment variables
- JWT-based admin authentication

## Project Structure

```text
client/   React frontend and admin dashboard
server/   Express API, database access, seed data
```

## Getting Started

Install dependencies:

```bash
npm install
```

Copy `server/.env.example` to `server/.env` and `client/.env.example` to
`client/.env`, then adjust their settings. Do not overwrite an existing `.env`.

Seed the configured database (this resets existing data):

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
CLIENT_ORIGIN=https://liberiadigitalinsights.com,https://www.liberiadigitalinsights.com,https://liberiadigitalinsights.up.railway.app
DB_CLIENT=postgres
DATABASE_URL=your_railway_postgres_url
```

## Environment configuration

The server reads `server/.env` regardless of the command's working directory.
Deployment environment variables take precedence over that file. Restart the
server after changing its environment.

| Server variable | Purpose / default |
| --- | --- |
| `PORT` | API port, default `5050` |
| `HOST` | Bind address, default `0.0.0.0` |
| `CLIENT_ORIGIN` | Comma-separated exact frontend origins; default `http://localhost:5173` |
| `DB_CLIENT` | `sqlite` or `postgres`; when empty, selects PostgreSQL if `DATABASE_URL` exists, otherwise SQLite if `SQLITE_PATH` exists |
| `DATABASE_URL` | PostgreSQL connection string |
| `SQLITE_PATH` | SQLite file path, relative to `server/` or absolute |
| `PGSSL` | Set `true` if the PostgreSQL provider requires SSL |
| `JWT_SECRET` | Token signing secret; set a strong private value in production |

Only origins listed in `CLIENT_ORIGIN` receive cross-origin access. Include every
frontend origin you use, including its protocol and nonstandard port.

The frontend reads `client/.env` and Vite mode files such as
`client/.env.production`. Deployment variables take precedence.

| Client variable | Purpose / default |
| --- | --- |
| `VITE_API_URL` | Browser API base URL including `/api`; defaults to same-origin `/api` |
| `API_PROXY_TARGET` | API server origin for the Vite development/preview proxy; default `http://127.0.0.1:5050` |
| `CLIENT_PORT` | Development port, default `5173` |
| `PREVIEW_PORT` | Preview/start port, default `4173` |
| `PORT` | Hosting port override for preview/start |
| `HOST` | Bind address; development defaults to `localhost`, preview to `0.0.0.0` |
| `ALLOWED_HOSTS` | Comma-separated additional frontend hostnames, without protocols or paths |

For example, to run the API on `6060` and frontend on `3000`, set server
`PORT=6060` and `CLIENT_ORIGIN=http://localhost:3000`, then set client
`CLIENT_PORT=3000`, `API_PROXY_TARGET=http://127.0.0.1:6060`, and
`VITE_API_URL=/api`. Start both with `npm run dev`.

For separate production deployments, set `VITE_API_URL` to the backend's full
API URL **before `npm run build`**, set the backend's `CLIENT_ORIGIN` to the
frontend origin, and add the frontend hostname to `ALLOWED_HOSTS` when using
Vite preview. Static hosting with `/api` requires an equivalent reverse proxy.
`VITE_` variables are public and embedded at build time: never put secrets in
them. Changing them requires rebuilding the frontend. Other client settings
require restarting Vite. `npm run start --workspace client` works on Windows
and Linux and reads its port from the environment.

## Railway routing troubleshooting

If Railway shows `Application failed to respond`, compare each domain's target
port under **Settings → Networking** with that service's listening port in the
deployment logs. The frontend and backend are separate services and may use
different ports. For a frontend listening on `8080` and backend configured with
`PORT=5050`, use target ports `8080` and `5050` respectively. Both services must
bind to `0.0.0.0`; set `HOST=0.0.0.0` if needed.

For the current deployment, the frontend variables should include:

```dotenv
VITE_API_URL=https://ldi-backend2.up.railway.app/api
ALLOWED_HOSTS=liberiadigitalinsights.com,www.liberiadigitalinsights.com
HOST=0.0.0.0
```

The backend's `CLIENT_ORIGIN` must list the frontend origins, for example:

```dotenv
CLIENT_ORIGIN=https://liberiadigitalinsights.com,https://www.liberiadigitalinsights.com
```

Keep any additional frontend origins you actually use in that list. A bare
hostname such as `ldi-backend2.up.railway.app/api` is not a valid `VITE_API_URL`.
After correcting it, rebuild and redeploy the frontend; restarting an existing
build does not replace its embedded API URL. Confirm the backend's `/api/health`
returns successfully before testing frontend data loading. If routing matches
but the backend still returns 502, inspect its deployment logs for startup or
database connection errors.

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
- `GET /api/videos`
- `GET /api/videos/:slug`
- `GET /api/trainings`
- `GET /api/trainings/:slug`
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
- `POST /api/videos`
- `PUT /api/videos/:id`
- `DELETE /api/videos/:id`
- `POST /api/trainings`
- `PUT /api/trainings/:id`
- `DELETE /api/trainings/:id`
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

The app uses image URLs for content management, making it simple to deploy before adding a file upload provider. When SQLite is selected, its database file is created at the configured `SQLITE_PATH`.
