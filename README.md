# Smart Campus Operations Hub

Smart Campus Operations Hub is a Spring Boot + React platform for managing campus resources, bookings, incidents, notifications, and role-based access across user, technician, manager, and admin workflows.

## Features

- User signup, login, password reset, and profile management
- Role-based dashboards for users, technicians, managers, and admins
- Resource booking and booking approvals
- Ticket submission, updates, and notifications
- Admin user management and notification preferences

## Project Structure

- `frontend/` - React + Vite client
- `backend_/backend/` - primary Spring Boot backend used by the current app
- `backend/` - alternate backend copy in the workspace
- `docs/` - project documentation and report sections

## Prerequisites

- Node.js 18+ and npm
- Java 21+
- Maven Wrapper (`mvnw.cmd` on Windows)
- MySQL 8+

## Local Setup

### 1. Database

Create a MySQL database named `smart_campus` and update the datasource credentials in the backend `application.properties` file if your local MySQL setup uses different values.

### 2. Start the backend

From the primary backend folder:

```powershell
cd backend_\backend
.\mvnw.cmd spring-boot:run
```

Backend default URL:

- `http://localhost:8080`

### 3. Start the frontend

From the frontend folder:

```powershell
cd frontend
cmd /c npm install
cmd /c npm run dev
```

Frontend default URL:

- `http://localhost:5173`

## Helpful Scripts

### Frontend

```powershell
cmd /c npm run build
cmd /c npm run lint
cmd /c npm run preview
```

### Backend

```powershell
cd backend_\backend
.\mvnw.cmd -DskipTests compile
```

## API Quick Check

Use Postman against the backend, not the Vite frontend.

- Login: `POST http://localhost:8080/api/auth/login`
- Signup: `POST http://localhost:8080/api/auth/signup`
- Verify signup: `POST http://localhost:8080/api/auth/signup/verify`
- Admin users: `GET http://localhost:8080/api/auth/admin/users`
- Update user: `PUT http://localhost:8080/api/auth/admin/users/{id}`
- Delete user: `DELETE http://localhost:8080/api/auth/admin/users/{id}`
- Update profile: `PUT http://localhost:8080/api/auth/profile`
- Delete profile: `DELETE http://localhost:8080/api/auth/profile?email=user@example.com`

## Default Accounts

The backend initializes default admin, manager, and technician accounts on startup.

## Troubleshooting

- If `npm run dev` fails in PowerShell, use `cmd /c npm run dev`.
- If Postman returns 404, make sure you are calling `http://localhost:8080`, not `http://localhost:5173`.
- If the backend does not start, check that MySQL is running and the `smart_campus` database exists.

## Documentation

Additional project notes and report sections live in the `docs/` folder.
