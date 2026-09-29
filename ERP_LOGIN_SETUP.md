# ERP Real Login Setup

ERP login is MongoDB-backed and uses enrollment + password + session. The browser does not select the user's role. The role is read from the `ERPUser` MongoDB document after password verification.

## 1. Environment

Create `.env` from `.env.example` and set:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=use-a-long-random-secret
NODE_ENV=development
```

Do not commit `.env`.

## 2. Install

```bash
npm install
```

## 3. Create an ERP user

```bash
node scripts/createErpUser.js STU001 MyPassword123 student 2025-26
node scripts/createErpUser.js FAC001 MyPassword123 faculty 2025-26
node scripts/createErpUser.js ADM001 MyPassword123 admin 2025-26
node scripts/createErpUser.js PRI001 MyPassword123 principal 2025-26
```

Passwords are stored as bcrypt hashes.

## 4. Start

```bash
npm run dev
```

Open:

```text
http://localhost:5000/erp
```

## 5. Security behavior

- Invalid enrollment/password: HTTP 401; no session is created.
- Wrong selected session: HTTP 401; no session is created.
- Correct credentials: server creates a regenerated session and redirects according to the role stored in MongoDB.
- The browser cannot choose the role.
- A student cannot open `/erp/admin`, faculty cannot open `/erp/principal`, etc.
- Session data is stored in MongoDB using `connect-mongo`.
- Password is never stored in the session.
