# TMS Mobile - React Native Application

A cross-platform React Native mobile application for the **Ticket Management System (TMS)** built using **Expo**, **React Native**, and **Axios**.

---

## 📱 Features

- **Authentication & RBAC:**
  - Secure Login with JWT token storage via `@react-native-async-storage/async-storage`
  - Role-based tabs: regular users see Home, Tickets, and Raise; SuperAdmin gets access to Masters and Reports.
- **Dashboard:**
  - Metric cards for Total, Pending, Assigned, Completed, and Closed complaints.
  - Recent activity overview with live pull-to-refresh.
- **Raise Complaint:**
  - Cascading Block and Room selectors
  - Complaint category picker (PC Hardware, PC Software, Network, Electronics, Plumbing, etc.)
  - Multiline description & remarks.
- **Ticket Management:**
  - Filter tickets by status (All, Pending, In-Progress, OnHold, Completed, Closed)
  - Real-time search across complaint type, room, block, or remarks
  - Status update dialog (for assigned technicians and SuperAdmin)
  - Ticket assignment dialog (for SuperAdmin to assign complaints to staff).
- **Masters Management (SuperAdmin):**
  - Full CRUD operations for Departments, Programmes, Blocks, Rooms, Roles, and Users.
- **Reports (SuperAdmin):**
  - Audit logs and filterable complaint reports with delete capability.
- **Dynamic API Config:**
  - In-app backend server settings modal to configure or switch backend IP/URL on the fly.

---

## 🚀 Getting Started

### 1. Prerequisites
- The backend server must be running on port 5000:
  ```powershell
  cd ../backend
  npm start
  ```
- Ensure MongoDB is running.

### 2. Run the React Native App

Navigate to the `mobile` folder:
```powershell
cd mobile
npx expo start
```

### 3. Run on Devices:

- **On your physical Android or iPhone:**
  1. Install **Expo Go** from Google Play Store or Apple App Store.
  2. Make sure your phone is connected to the same Wi-Fi network (`10.193.229.140`).
  3. Scan the QR code displayed in the terminal with Expo Go (Android) or the Camera app (iOS).

- **On Android Emulator:**
  ```powershell
  npx expo run:android
  # or press 'a' in the interactive terminal
  ```

- **In Web Browser:**
  ```powershell
  npx expo start --web
  # or press 'w' in the interactive terminal
  ```

---

## 🔑 Default Credentials

- **Username:** `admin`
- **Password:** `adminpassword`
- *(Use the "Fill Default Admin Credentials" button on the login screen for instant testing)*.
