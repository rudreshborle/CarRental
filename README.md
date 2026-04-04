# EliteWheels - Technical Platform Documentation

EliteWheels is a production-grade, serverless car rental platform built entirely with modern web standards (HTML5, CSS3, and Vanilla JavaScript). This document provides an exhaustive technical breakdown of the architecture, data structures, and implementation logic.

---

## 1. Technical Stack

| Category | Technologies | Key Features Used |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic elements, SVG icons, Native Form Validation. |
| **Styles** | CSS3 | Custom Properties (Variables), Flexbox, CSS Grid, Transitions/Animations. |
| **Logic** | JavaScript (ES6+) | Template Literals, DOM Manipulation, Async/Await (FileReader), URLSearchParams. |
| **Storage** | Web Storage API | `localStorage` (Persistent Database), `sessionStorage` (Active Sessions). |

---

## 2. System Architecture

The project follows a **Modular Monolith** pattern on the frontend, separating concerns between data persistence, UI state, and feature-specific logic.

### A. The Persistence Layer (`js/data.js`)
Acts as the application's "Mock Backend." It initializes the global state and provides a standardized `db` adapter to interact with `localStorage`.
- **Initialization**: On first load, it populates the browser storage with `DUMMY_CARS` and a default Admin user.
- **Data Patching**: Includes a self-executing "Migration" system that updates existing local storage data whenever the source code defaults (like prices or image paths) are updated.

### B. The UI Core (`js/app.js`)
Manages global application state and shared UI components.
- **Dynamic Injection**: Automatically renders the Navbar and Footer based on user authentication status.
- **Session Management**: Handles Login/Logout flows and session persistence.
- **Theme Engine**: Manages the global `data-theme` attribute (Light/Dark mode) and syncs it with `localStorage`.

### C. Feature Modules
- **`js/auth.js`**: Pure logic for registration and login validation.
- **`js/cars.js`**: Implements a real-time filtering engine (Type, Search, Price Range).
- **`js/booking.js`**: Handles complex date-range calculations and transaction processing.
- **`js/admin.js`**: Exclusive administrative logic for fleet and booking overrides.

---

## 3. Data Schema & Structures

All data is stored as JSON strings in `localStorage`. Below are the primary object definitions:

### Vehicle Object (`cars`)
```json
{
  "id": "c_123",
  "brand": "Mahindra",
  "model": "Thar",
  "year": 2023,
  "type": "SUV",
  "price_per_day": 3500,
  "availability": true,
  "image": "assets/images/thar.png" 
}
```

### Booking Object (`bookings`)
```json
{
  "booking_id": "b_xyz",
  "user_id": "user_123",
  "car_id": "c_123",
  "pickup_date": "2026-04-10",
  "return_date": "2026-04-15",
  "total_amount": 17500,
  "status": "Confirmed"
}
```

---

## 4. Advanced Logic Implementation

### A. Dynamic Theming
State is managed via a root CSS variable system. When a user toggles the theme, the `initTheme` function updates the `<html>` attribute:
```css
/* style.css */
[data-theme="dark"] {
    --bg-color: #0f172a;
    --card-bg: #1e293b;
    --text-primary: #f8fafc;
}
```

### B. Admin Image Handling
The Admin Panel supports both URL-based images and **Direct File Uploads**. 
- **Method**: When a file is uploaded, the system uses the `FileReader` API to convert the binary image into a **Base64 Data URL**.
- **Result**: This allows large image assets to be persisted directly within the text-based `localStorage` database without an external server.

### C. Booking Math
Calculations are performing using the `Time / (1000 * 60 * 60 * 24)` formula to find the day difference between two UTC dates. The calculation is **Inclusive** (Start and End days are both counted).

---

## 5. File Structure Overview

```text
/
├── index.html          # Homepage & Featured Cars
├── cars.html           # Fleet browser with Filters
├── booking.html        # Booking engine & Payment mock
├── dashboard.html      # User's personal panel
├── admin.html          # Security-locked Management Panel
├── login.html/register # User Entry points
├── css/
│   ├── style.css       # Core tokens & Dark mode logic
│   └── components.css  # Reusable UI (Cards, Modals, Buttons)
├── js/
│   ├── data.js         # Local Database & Utils
│   ├── app.js          # Shared UI & Auth state
│   ├── auth.js         # Security logic
│   ├── cars.js         # Filtering & Fleet render
│   ├── booking.js      # Rental math & checkouts
│   ├── dashboard.js    # Profile & Booking history
│   └── admin.js        # Fleet management & Overrides
└── assets/images/      # Local vehicle inventory
```

---

## 6. Developer Guide
To extend the fleet, simply update the `DUMMY_CARS` array in `js/data.js`. The built-in **Migration Logic** (`patchPrices`) will automatically sync your changes to the user's local instance upon their next page refresh.