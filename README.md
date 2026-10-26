# Ticket Management System (TMS)

A premium web application for managing hardware and software complaints with Role-Based Access Control (RBAC).

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, MongoDB, JWT

## Setup Instructions

### 1. Backend Setup
1. Open a terminal in the `backend` directory.
2. Run `npm install`.
3. Ensure MongoDB is running on your system (default URI: `mongodb://localhost:27017/tms_db`).
4. Start the server: `npm start` (or `node server.js`).

### 2. Create SuperAdmin User
As per requirements, you need to create the initial SuperAdmin using Postman or any API client.
- **Endpoint:** `POST http://localhost:5000/api/auth/setup-admin`
- **Body (JSON):** (Empty or any)
- **Note:** This endpoint only works once to create the first admin.
- **Default Credentials created:**
  - **Username:** `admin`
  - **Password:** `adminpassword`

### 3. Frontend Setup
1. Open a terminal in the `frontend` directory.
2. Run `npm install`.
3. Start the dev server: `npm run dev`.
4. Open your browser at `http://localhost:5173`.

## Features
- **SuperAdmin:** Full access to Masters (Department, Programme, Block, Room, Role, User) and Reports.
- **User:** Can raise complaints and view their own status.
- **Staff/Technician:** Can view assigned complaints and update status from Assigned to In-Progress, OnHold, or Completed.
- **Premium UI:** Glassmorphism effects, responsive design, and modern typography.
