# Neha Industrial Security – Management System

Full stack dashboard to replace the paper register: guards, clients (companies), sites,
contractors, deployments (which guard is where), daily attendance, monthly payroll and reports.

**Stack:** React 18 (Vite) · Tailwind CSS · Redux Toolkit · React-Toastify · Node.js · Express · MSSQL

## 1. Database
1. Create a database in SQL Server (e.g. `NehaSecurity`).
2. Run `database/schema.sql` in SSMS / Azure Data Studio (tables + sample data).
   WARNING: the script drops and recreates the tables – run it only once on a fresh database.

## 2. Server
```bash
cd server
cp .env.example .env       # fill in your SQL Server details + JWT_SECRET
npm install
npm run seed:admin         # creates login  admin / Admin@123  (change after first login)
npm run dev                # http://localhost:5000
```

## 3. Client
```bash
cd client
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Modules
| Module | What it does |
|---|---|
| Dashboard | Guard / client / site counts, unassigned guards, today's attendance, payroll status, sites short of guards |
| Guards | Full profile (ID proofs, bank, PF/ESI, salary, contractor), search + filters, profile page with deployment history |
| Clients | Company details, contact person, GST, contract dates |
| Sites | Client locations with required guard count |
| Contractors | Contractors supplying guards |
| Deployments | Assign / transfer / end a guard's posting – full history kept |
| Attendance | Per site, per day sheet (P / A / HD / L / WO + overtime) |
| Payroll | Generate month payroll from attendance, PF/ESI, advance, mark paid |
| Reports | Guard-site list, monthly attendance, payroll – export CSV |

## Payroll rules (edit in `server/src/controllers/payroll.controller.js`)
* Daily rate = monthly salary / days in month
* Payable days = Present + 0.5 x Half-day + Paid-leave + Weekly-off
* OT amount = OT hours x (daily rate / 8) x `OT_MULTIPLIER` (default 2)
* PF = 12% of earned basic (if guard has PF), ESI = 0.75% of gross (if ESI and monthly salary <= 21,000)

## Structure
```
database/schema.sql
server/src/{config,middleware,utils,controllers,routes}
client/src/{app,components,features,pages,services,utils}
```
