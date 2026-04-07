# it3030-paf-2026-smart-campus

Smart Campus Operations Hub: a Spring Boot + React web platform for managing campus resources, bookings, incidents, notifications, and role-based access with MySQL persistence.

## Project Stack

- Backend: Spring Boot, Java 21, IntelliJ IDEA
- Frontend: React, Vite, VS Code
- Database: MySQL
- Version control: GitHub with GitHub Actions

## Key Docs

- [Booking Management contribution](docs/booking-management-section.md)
- [Team work division](docs/team-work-division.md)
- [Booking Management final report section](docs/booking-management-report.md)

## MySQL Setup

- Create the `smart_campus` database before starting the backend.
- Update `backend_/backend/src/main/resources/application.properties` with your local MySQL username and password.

## Run Order

1. Start MySQL.
2. Run the Spring Boot backend.
3. Start the React frontend.

## Booking Module Scope

The Booking Management module includes booking creation, own-booking viewing, updates, cancellation, approval/rejection, overlap prevention, calendar view, QR check-in, and recurring booking support.
