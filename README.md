# NIS Security Management Dashboard

A full-stack Security Workforce Management System designed to streamline security guard operations, client management, site deployments, attendance tracking, payroll processing, and reporting.

The application provides a centralized dashboard for managing security personnel and business operations efficiently, with role-based access control and real-time database connectivity.

---

## 📌 Project Overview

The NIS Security Management Dashboard is developed to simplify and digitize the daily operations of a security services company.

It helps administrators manage employees (security guards), clients, contractors, security sites, deployments, attendance, and monthly payroll from a single platform.

The system reduces manual paperwork, improves operational visibility, and provides accurate workforce and salary management.

## ✨ Key Features

### 1\. Authentication & Authorization

- Secure user login.
- JWT-based authentication.
- Role-based access control.
- Admin-only access to sensitive operations.
- Change password functionality.
- Protected API routes.
- Secure password hashing using bcrypt.

### 2\. Dashboard

- Total active security guards.
- Total active clients.
- Total active security sites.
- Total contractors.
- Unassigned security guards.
- Daily attendance overview.
- Monthly payroll overview.
- Sites requiring additional guards.
- Client-wise guard deployment statistics.

### 3\. Guard Management

- Add new security guards.
- View all registered guards.
- Update guard information.
- Deactivate guards.
- Automatically generate unique guard codes.
- Maintain personal and professional information.

Guard information includes:

- Full name and father's name.
- Contact numbers.
- Gender and date of birth.
- Address.
- Aadhaar number and PAN number.
- Bank account information.
- PF and ESI applicability.
- Monthly salary.
- Joining date.
- Contractor details.
- Emergency contact information.

### 4\. Client Management

- Register new clients.
- Manage client information.
- Update client details.
- Activate or deactivate clients.
- View associated security sites.
- Track deployed guards for each client.

Client information includes:

- Company name.
- Contact person.
- Phone number.
- Email address.
- Business address.
- City.
- GST number.
- Contract start and end dates.

### 5\. Site Management

- Create and manage security sites.
- Associate sites with clients.
- Define required guard strength.
- Assign site supervisors.
- Maintain site addresses and locations.
- Track deployed guards.
- Activate or deactivate sites.

### 6\. Contractor Management

- Register security contractors.
- Manage contractor information.
- Maintain PAN and license details.
- Track contractor contact information.
- View the number of guards associated with each contractor.

### 7\. Guard Deployment Management

- Assign guards to security sites.
- Select Day, Night, or General shifts.
- Transfer guards between sites.
- Maintain deployment history.
- End existing deployments.
- View current deployment information.
- Track client-wise and site-wise guard allocations.

When a guard is assigned to a new site, the existing active deployment is automatically closed.

### 8\. Attendance Management

- Daily attendance marking.
- Site-wise attendance sheets.
- Bulk attendance submission.
- Monthly attendance summaries.
- Overtime hour tracking.
- Attendance remarks.

Supported attendance statuses:

| Status | Description |
| --- | --- |
| P | Present |
| A | Absent |
| HD | Half Day |
| L | Leave |
| WO | Weekly Off |

Additional features:

- Prevent attendance marking for future dates.
- Prevent attendance modification after salary payment.
- Calculate monthly payable days.
- Track overtime hours.

### 9\. Payroll Management

- Generate monthly payroll automatically.
- Calculate salary based on attendance.
- Calculate overtime payments.
- PF deduction calculation.
- ESI deduction calculation.
- Advance deductions.
- Other deductions.
- Net salary calculation.
- Update pending payroll deductions.
- Mark salaries as paid.
- Maintain payment references and payment modes.
- Prevent modification of already-paid payroll records.

Payroll calculation includes:

- Monthly basic salary.
- Payable attendance days.
- Overtime amount.
- Gross salary.
- PF deductions.
- ESI deductions.
- Advance deductions.
- Other deductions.
- Final net payable salary.

**Payroll Configuration:**

| Component | Configuration |
| --- | --- |
| Overtime multiplier | 2x hourly rate |
| PF employee contribution | 12% |
| ESI employee contribution | 0.75% |
| ESI salary eligibility limit | ₹21,000 |

### 10\. Reports

- Guard deployment report.
- Guard-wise deployment information.
- Client-wise deployment details.
- Site-wise deployment information.
- Contractor information.
- Current shift and deployment date.

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- Axios
- React Toastify
- CSS

### Backend

- Node.js
- Express.js
- JavaScript (ES Modules)
- JSON Web Token (JWT)
- bcryptjs
- Express Validator
- Helmet
- CORS
- Morgan
- Express Rate Limit

### Database

- Microsoft SQL Server (MSSQL)
- mssql Node.js driver
- Parameterized SQL queries
- SQL Transactions

---

## 📂 Project Structure

text

```text
NIS-Dashboard/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── guard.controller.js
│   │   │   ├── client.controller.js
│   │   │   ├── site.controller.js
│   │   │   ├── contractor.controller.js
│   │   │   ├── deployment.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── payroll.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── report.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── error.js
│   │   │   └── validate.js
│   │   │
│   │   ├── routes/
│   │   │   └── index.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── crudFactory.js
│   │   │   ├── dates.js
│   │   │   └── pagination.js
│   │   │
│   │   └── server.js
│   │
│   ├── scripts/
│   ├── .env
│   └── package.json
│
└── README.md
```

_Note: The structure above represents the main application modules. Additional frontend files, SQL scripts, and configuration files may exist in the actual project._

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Node.js (v18 or above recommended).
- npm.
- Microsoft SQL Server.
- SQL Server Management Studio (SSMS).
- Git.

### 1\. Clone the Repository

bash

```bash
git clone YOUR_REPOSITORY_URL
cd NIS-Dashboard
```

### 2\. Backend Setup

Navigate to the server directory:

bash

```bash
cd server
```

Install dependencies:

bash

```bash
npm install
```

### 3\. Configure Environment Variables

Create a `.env` file inside the `server` directory.

env

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:5173

DB_SERVER=localhost
DB_PORT=1433
DB_NAME=NIS_Security
DB_USER=your_database_username
DB_PASSWORD=your_database_password

DB_ENCRYPT=false
DB_TRUST_CERT=true

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=12h

ADMIN_USER=admin
ADMIN_PASSWORD=your_admin_password
```

Update the database credentials according to your SQL Server configuration.

### 4\. Initialize the Database

- Open SQL Server Management Studio.
- Connect to your SQL Server instance.
- Create the application database.
- Execute the project's database schema SQL script.
- Verify that all required tables have been created.

### 5\. Create or Reset Administrator Account

Run:

bash

```bash
npm run seed:admin
```

If the project does not have this npm script configured, execute the corresponding admin seed file directly:

bash

```bash
node scripts/seedAdmin.js
```

Use the administrator credentials configured in your environment variables.

### 6\. Start the Backend

bash

```bash
npm run dev
```

Backend server:

text

```text
http://localhost:5000
```

Health check:

text

```text
http://localhost:5000/api/health
```

Expected response:

json

```json
{
  "status": "ok"
}
```

### 7\. Frontend Setup

Open another terminal:

bash

```bash
cd client
```

Install dependencies:

bash

```bash
npm install
```

Create a `.env` file inside the client directory:

env

```env
VITE_API_URL=http://localhost:5000/api

TOKEN_KEY=nis_security_token
USER_KEY=nis_security_user
```

Start the frontend:

bash

```bash
npm run dev
```

Frontend application:

text

```text
http://localhost:5173
```

---

## 🔐 Authentication Flow

The application uses JWT authentication.

1. User enters username and password.
2. Backend verifies the credentials against the SQL Server database.
3. Password is validated using bcrypt.
4. Backend generates a JWT token.
5. Frontend stores the token in local storage.
6. Axios automatically attaches the token to protected API requests.
7. Backend middleware validates the token.
8. Role-based middleware controls access to administrative operations.

### User Roles

| Role | Permissions |
| --- | --- |
| Admin | Full administrative access |
| Supervisor | Operational access to permitted modules |

---

## 🔗 API Endpoints

Base URL:

text

```text
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get logged-in user |
| POST | `/auth/change-password` | Change password |

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Dashboard statistics |

### Guards

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/guards` | Get all guards |
| GET | `/guards/:id` | Get guard details |
| POST | `/guards` | Create guard |
| PUT | `/guards/:id` | Update guard |
| DELETE | `/guards/:id` | Deactivate guard |

### Clients

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/clients` | Get all clients |
| GET | `/clients/:id` | Get client |
| POST | `/clients` | Create client |
| PUT | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Deactivate client |

### Sites

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/sites` | Get all sites |
| GET | `/sites/:id` | Get site |
| POST | `/sites` | Create site |
| PUT | `/sites/:id` | Update site |
| DELETE | `/sites/:id` | Deactivate site |

### Contractors

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/contractors` | Get contractors |
| GET | `/contractors/:id` | Get contractor |
| POST | `/contractors` | Create contractor |
| PUT | `/contractors/:id` | Update contractor |
| DELETE | `/contractors/:id` | Deactivate contractor |

### Deployments

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/deployments` | List deployments |
| POST | `/deployments` | Assign guard |
| PUT | `/deployments/:id/end` | End deployment |

### Attendance

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/attendance/sheet` | Get attendance sheet |
| GET | `/attendance/summary` | Get monthly summary |
| POST | `/attendance/bulk` | Save bulk attendance |

### Payroll

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/payroll` | Get payroll records |
| POST | `/payroll/generate` | Generate monthly payroll |
| PUT | `/payroll/:id` | Update deductions |
| PATCH | `/payroll/:id/pay` | Mark salary as paid |

### Reports

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/reports/guard-deployment` | Guard deployment report |

---

## 🛡️ Security Features

- JWT-based authentication.
- Password hashing with bcrypt.
- Role-based authorization.
- Helmet security headers.
- CORS configuration.
- Login rate limiting.
- Express request validation.
- Parameterized SQL queries.
- Centralized error handling.
- Database transactions for critical operations.
- Soft deletion to preserve historical records.

---

## 📊 Database & Business Logic

The application uses Microsoft SQL Server as its primary database.

Important database entities include:

- Users
- Guards
- Clients
- Sites
- Contractors
- Deployments
- Attendance
- Payments

Relationships between these entities support guard allocation, client management, attendance tracking, and payroll processing.

The backend uses a reusable CRUD factory to reduce repetitive code for standard resource operations.

Database transactions are used where multiple related operations must succeed or fail together.

---

## 🚀 Future Enhancements

Potential future improvements include:

- Excel and PDF report exports.
- Bulk employee import using Excel.
- Employee document uploads.
- Guard profile photographs.
- Salary slip PDF generation.
- Automated monthly payroll notifications.
- WhatsApp and SMS notifications.
- Advanced attendance analytics.
- GPS-based attendance.
- Multi-branch management.
- Audit logs.
- Advanced dashboard charts.
- Automated database backups.

---

## 👨‍💻 Development

Run frontend and backend separately during development.

**Backend:**

bash

```bash
cd server
npm run dev
```

**Frontend:**

bash

```bash
cd client
npm run dev
```

---

## 📄 License

This project is developed for NIS Security Management.

All rights reserved.

---

**NIS Security Management Dashboard**

_Smart Workforce Management | Security Operations | Attendance | Payroll | Reporting_