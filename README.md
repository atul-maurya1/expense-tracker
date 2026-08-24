# Expense Tracker - Production-Ready SaaS Web Application

A complete, production-quality personal finance management application with a Node.js/Express/MongoDB backend and a React/Vite/Tailwind CSS frontend. Recreates a professional dashboard UI with robust transaction management, visual analytics, budgets, custom categories, reports, secure authentication, and dark mode.

## 🚀 Features

- **Secure Authentication**: Register and log in securely. Authentication tokens are stored in secure HTTP-only cookies (no localStorage tokens) with JWT and hashed passwords using bcrypt.
- **Income & Expense Tracking**: Create, view, update, and delete transactions with currency support (default: INR `₹`).
- **Budgets Management**: Set overall or category-specific monthly budgets. Dynamic progress bars change colors based on limits: green (<80%), amber (80-100%), and red/danger (>100% exceeded).
- **Interactive Charts**: Donut/Pie charts for category-wise breakdowns, Bar charts comparing income vs. expenses, and Area charts for spending trends over 7D, 30D, 3M, 6M, and 1Y.
- **Advanced Analytics**: Tracks savings rates, net savings, highest category spending, average daily/monthly spending, and top expenses.
- **Category Customization**: Standard default categories (11 expenses, 6 incomes) are seeded automatically, with full capability for users to add their own custom categories.
- **Settings & Security**: Custom options to update profile info, toggle currencies, change passwords, and choose between Light, Dark, or System themes.
- **Export Reports**: Generate CSV reports of transaction data filtered by search terms, date ranges, and categories. Print financial summaries directly.
- **Fully Responsive**: Mobile-drawer navigation, collapsible sidebar on tablets, stackable cards, and auto-resizing charts.

---

## 🛠️ Tech Stack

### Frontend
- **React.js & Vite**: Fast SPA UI compilation.
- **Tailwind CSS**: Utility-first CSS framework with dark-mode class strategy.
- **React Router Dom (v6)**: Single-page application routing.
- **Recharts**: Responsive charts and graphs.
- **Lucide React**: Clean icons.
- **React Hook Form & Zod**: Form state and schema validation.
- **React Hot Toast**: Beautiful notification toasts.
- **Axios**: Configured client with `withCredentials: true`.

### Backend
- **Node.js & Express.js**: Fast API runtime.
- **MongoDB & Mongoose**: Document database and object modeling.
- **JSON Web Tokens (JWT)**: Secure cookie-based authentication.
- **bcryptjs**: 10-round password hashing.
- **Helmet & CORS**: Secure headers and cross-origin resource sharing.
- **express-rate-limit**: Rate limiting (200 requests/15min globally, 20 requests/15min for auth).
- **cookie-parser**: Native cookie parsing middleware.

---

## 📂 Folder Structure

```text
expense-tracker/
│
├── client/                     # Frontend Application
│   ├── public/                 # Static assets
│   └── src/
│       ├── assets/             # Images and styles
│       ├── components/
│       │   ├── common/         # Buttons, modals, stat cards, skeletons, spinners
│       │   ├── dashboard/      # Chart and stats integrations
│       │   ├── transactions/   # Filter bar, forms, tables
│       │   ├── budgets/        # Budget cards and summaries
│       │   ├── analytics/      # Metric tables and graphs
│       │   └── layout/         # Sidebar, Navbar, and layout wrapper
│       ├── pages/              # SPA route pages
│       ├── context/            # Auth and Theme React Contexts
│       ├── hooks/              # Custom data fetching hooks
│       ├── services/           # Centralized Axios instance
│       ├── utils/              # Currency and Date formatters
│       └── constants/          # Default categories and configs
│
├── server/                     # Backend API Server
│   ├── config/                 # DB configuration
│   ├── controllers/            # Controller layers
│   ├── middleware/             # Auth, error, and validation rules
│   ├── models/                 # Mongoose database schemas
│   ├── routes/                 # Express API routes
│   └── utils/                  # ApiError, ApiResponse helpers
│
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18+ recommended)
- **MongoDB** (Running on `mongodb://localhost:27017`)

---

## 🔧 Installation & Setup

### 1. Database Setup
Ensure your local MongoDB instance is running:
```bash
# Start MongoDB service (Windows PowerShell)
Start-Service MongoDB
```

### 2. Backend Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` fields as needed:
   ```text
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *Note: On first startup, the server automatically seeds the 17 default categories into your database.*

### 3. Frontend Setup
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment:
   Create a `.env` file:
   ```bash
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *By default, Vite will start the app on `http://localhost:5173` (or the next available port like `5174`).*

---

## 🔌 API Documentation

All protected endpoints require the JWT token to be present in the `token` cookie.

### Authentication (`/api/auth`)
- `POST /register` - Register a new user account.
- `POST /login` - Log in and obtain the HTTP-only auth token.
- `POST /logout` - Log out and clear the auth token.
- `GET /me` - Get current user profile details (safe properties).

### Transactions (`/api/transactions`)
- `POST /` - Create a transaction.
- `GET /` - List transactions (supports pagination, category filtering, search, sorting, and type filters).
- `GET /:id` - Get details of a single transaction.
- `PATCH /:id` - Update details of a transaction.
- `DELETE /:id` - Delete a transaction.

### Budgets (`/api/budgets`)
- `POST /` - Define a new monthly budget limit.
- `GET /` - List user's budgets with live spent summaries, remaining totals, and usage percentages.
- `PATCH /:id` - Update a budget amount.
- `DELETE /:id` - Delete a budget.

### Categories (`/api/categories`)
- `GET /` - Fetch standard default + user custom categories.
- `POST /` - Add a custom category.
- `PATCH /:id` - Edit custom category metadata.
- `DELETE /:id` - Remove custom category.

### Analytics (`/api/analytics`)
- `GET /dashboard` - Fetch overview widgets, monthly comparisons, last 12 months, and current category shares.
- `GET /analytics` - Get detailed financial trends, daily averages, and savings metrics.
- `GET /spending-trend` - Get time-series data for area chart plots.

---

## 🛠️ Troubleshooting

- **CORS Errors**: Ensure the `CLIENT_URL` in `server/.env` matches the exact port/address Vite is running on (e.g. `http://localhost:5173` or `http://localhost:5174`).
- **Database Connection Failures**: Verify your local MongoDB is running at the port specified in `MONGO_URI`.
- **Theme Not Updating**: Refresh the browser to allow Tailwind's DOM class compiler to sync with stored context configs.
- **Port In Use**: If port 5000 is occupied, you can modify `PORT=5001` in the backend `.env` and update the frontend `VITE_API_URL` to match.
