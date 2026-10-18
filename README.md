# Campus Access — Mini MERN Authentication & Role-Based Dashboard

A complete, clean MERN (MongoDB, Express, React, Node.js) web application with role-based access control (Admin, Faculty, Student) built according to the **CDC Developer Selection Assignment**.

---

## 1. Project Overview

- **Admin**: Creates and manages Faculty and Student accounts, changes account passwords, and views user directories.
- **Faculty**: Logs in and views only their own profile details.
- **Student**: Logs in, views their own profile details, and sees their unique student QR code.
- **Security**: Passwords hashed with `bcryptjs` (salt rounds: 12), JWT authentication stored in HTTP-only cookies, role-based authorization enforced on the backend via Express middleware.
- **UI**: Modern, responsive interface styled with Tailwind CSS, featuring custom login artwork.

---

## 2. Project Structure

```text
project/
  server/
    src/
      config/db.js
      models/User.js
      controllers/
        auth.controller.js
        admin.controller.js
        profile.controller.js
      routes/
        auth.routes.js
        admin.routes.js
        profile.routes.js
      middleware/
        auth.middleware.js
        role.middleware.js
        error.middleware.js
      scripts/seedAdmin.js
      app.js
      server.js
    .env.example
    package.json

  client/
    src/
      api/
        apiClient.js
        auth.api.js
        admin.api.js
        profile.api.js
      components/
        Navbar.jsx
        ProtectedRoute.jsx
        RoleRoute.jsx
        FormInput.jsx
      pages/
        LoginPage.jsx
        AdminDashboard.jsx
        FacultyDashboard.jsx
        StudentDashboard.jsx
      context/AuthContext.jsx
      App.jsx
      main.jsx
    package.json

  README.md
```

---

## 3. Technology Stack

- **Frontend**: React, React Router 7, Tailwind CSS, Lucide React, `qrcode.react`, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) in HTTP-only cookies, password hashing with `bcryptjs`
- **Security**: `helmet`, rate limiting (`express-rate-limit`), origin checks, strict input validation

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js 20.19+ or 22.12+ (Node.js 24 is supported)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Copy environment variables:
   ```bash
   Copy-Item .env.example .env
   ```
   Set `JWT_SECRET` to a unique random value of at least 32 characters, set `APP_ORIGIN` to the exact frontend origin, and set `MONGODB_URI` to your MongoDB connection string. The example values are placeholders; do not commit `.env`. For Atlas, use its connection URI and allow your deployment service's network access in Atlas.
   In PowerShell, you can generate a secret with `[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`.
4. Seed the initial Admin account:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or npm start
   ```
   *API will run on `http://localhost:4000`*

### Frontend Setup
1. Navigate to the `client` directory in another terminal:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`. Its `/api` requests proxy to `http://127.0.0.1:4000` by default. If the API uses another port, set `API_PROXY_TARGET` to that API origin before starting Vite.*

---

## 5. Environment Variables (`server/.env`)

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | Express server port | `4000` |
| `HOST` | Bind address; use `0.0.0.0` on a hosting service | `127.0.0.1` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/campus_access` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *(At least 32 random characters)* |
| `APP_ORIGIN` | Allowed client origin for CORS/CSRF | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |
| `ADMIN_NAME` | Default seeded admin name | `Campus Administrator` |
| `ADMIN_EMAIL` | Initial admin email used by `npm run seed` | Set your own |
| `ADMIN_PASSWORD` | Initial admin password used by `npm run seed` | Set a unique password |

The backend requires `JWT_SECRET`, `APP_ORIGIN`, and `MONGODB_URI` at startup. A missing or placeholder secret causes a configuration error before MongoDB is contacted. The frontend uses relative `/api` paths. With `NODE_ENV=production`, Express serves the built `client/dist` frontend and API on one origin. Set `APP_ORIGIN` to that public origin (for example, `https://your-service.example`) and `HOST=0.0.0.0` on the host. Build with `npm ci --prefix server`, `npm ci --prefix client`, and `npm run build --prefix client` from the repository root, then start with `npm start --prefix server`. Do not deploy the Vite development server as the production frontend.

Run `npm test` from `server/` for API smoke checks and `npm run build` from `client/` for the production frontend build. Run `npm audit` in each directory to check both dependency trees.

### Render deployment

The repository's `render.yaml` defines one free web service that builds the React client, serves it from Express, and runs the initial admin seed on startup. In Render, create a Blueprint from this GitHub repository and choose the intended workspace. Supply `MONGODB_URI`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` in Render's private setup fields. Render generates `JWT_SECRET` and sets `APP_ORIGIN` to the service's own HTTPS URL. Render supplies `NODE_ENV=production` at runtime. Do not copy the local development `.env` into Render.

Use a MongoDB Atlas database reachable from Render and confirm Atlas network access before applying the Blueprint. The first deployment is complete only after `/api/health` and the login page respond and the admin account can sign in. Render's free web service may spin down when idle; consult Render's current free-plan limits before using it for a production audience.

---

## 6. API Endpoints Contract

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues HTTP-only session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clears session cookie and invalidates token session version |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user details |
| `POST` | `/api/admin/faculty` | Admin only | Creates a new Faculty account |
| `GET` | `/api/admin/faculty` | Admin only | Lists all created Faculty accounts |
| `POST` | `/api/admin/students` | Admin only | Creates a new Student account |
| `GET` | `/api/admin/students` | Admin only | Lists all created Student accounts |
| `PATCH` | `/api/admin/faculty/:id/status` | Admin only | Activates/deactivates a Faculty account |
| `PATCH` | `/api/admin/students/:id/status` | Admin only | Activates/deactivates a Student account |
| `POST` | `/api/admin/accounts/:id/password` | Admin only | Changes an account's password (Role & User dropdowns) |
| `GET` | `/api/profile/me` | Authenticated | Returns current user's verified own profile |

---

## 7. Testing Checklist Verification

- [x] **Seeded Admin Login**: Admin seeds via `npm run seed` and logs in with credentials.
- [x] **Invalid Credentials**: Rejected with useful error messages.
- [x] **Account Creation**: Admin creates Faculty and Student accounts.
- [x] **Duplicate Prevention**: Duplicate emails and student roll numbers are rejected with HTTP 409.
- [x] **Faculty Dashboard**: Faculty member logs in and views only their own profile details.
- [x] **Student Dashboard & QR Code**: Student logs in, views their profile, and unique QR code.
- [x] **Unique Student QR**: Generated via `crypto.randomUUID()` and mapped uniquely to each student.
- [x] **Access Control**: Faculty and Students are strictly blocked from `/admin` and Admin-only APIs (HTTP 403).
- [x] **Data Privacy**: Profile endpoint `/api/profile/me` derives identity purely from server-verified JWT cookie.
- [x] **Password Protection**: Passwords hashed with bcrypt (salt cost 12), password hashes never returned in API responses.
- [x] **Logout Flow**: Logs out and invalidates session version in database.

---

## 8. AI Tools & Assistance

AI assistance was utilized for rapid boilerplate layout setup, initial Tailwind CSS component structure, and test suite verification. All backend authentication flows, role middlewares, and security boundaries were audited, verified, and trace-tested to ensure complete compliance with the assignment specification.
