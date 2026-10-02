# Masroofe — Expense Tracker

A full stack web app to track personal expenses. Add, edit, delete, and filter expenses, and see the total, the number of expenses, and the highest expense at a glance. Data is stored in PostgreSQL through a REST API built with Node.js and Express.

## Features

- Add an expense (title, amount, category, date) with validation
- Edit an expense in a modal
- Delete an expense
- Filter by category
- Summary cards: total spent, number of expenses, highest expense
- Loading spinner and clear error alerts
- Responsive design (CSS Grid and Bootstrap)

## Tech stack

- Frontend: HTML, CSS, JavaScript, Bootstrap 5
- Backend: Node.js, Express, pg, dotenv, cors
- Database: PostgreSQL

## Project structure

```
expense-tracker/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── schema.sql
│   └── .env.example
├── screenshots/
└── README.md
```

## How to run

### 1. Create the database

1. Open pgAdmin and make sure PostgreSQL is running.
2. Create an empty database named `expense_tracker`.
3. Open the Query Tool on it, then run the contents of `backend/schema.sql`.

### 2. Set up the environment file

1. Go to the `backend` folder.
2. Copy `.env.example` to a new file named `.env`.
3. Write your PostgreSQL password in `DB_PASSWORD`.

### 3. Install the packages

```bash
cd backend
npm install
```

### 4. Start the server

```bash
node server.js
```

You should see:

```
Server running on http://localhost:3000
Connected to the database successfully!
```

### 5. Open the frontend

Open `frontend/index.html` with the Live Server extension in VS Code. The app opens at `http://127.0.0.1:5500/frontend/index.html`.

## API endpoints

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/expenses` | Get all expenses | 200 | — |
| GET | `/api/expenses/:id` | Get one expense | 200 | 404 |
| POST | `/api/expenses` | Add an expense | 201 | 400 |
| PUT | `/api/expenses/:id` | Update an expense | 200 | 400, 404 |
| DELETE | `/api/expenses/:id` | Delete an expense | 200 | 404 |

Expense shape:

```json
{
  "id": 1,
  "title": "Lunch",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-01-15"
}
```

Allowed categories: `Food`, `Transport`, `Bills`, `Entertainment`, `Other`.

## Screenshots

### Desktop
![Desktop view](screenshots/desktop.png)

### Mobile
![Mobile view](screenshots/mobile.png)

## The hardest things I faced

### 1. The server stopped suddenly

**The problem:** The page opened, but the expenses list was empty. The Console showed `ERR_CONNECTION_REFUSED`, and the app showed "Cannot connect to the server". The backend had stopped running.

**How I solved it:** I opened the terminal in the `backend` folder and started the server again with `node server.js`. I checked that it printed "Connected to the database successfully!". I learned that the frontend depends on the backend being up all the time, and that the Console shows the real error.

### 2. Running the app on my phone

**The problem:** The app worked on my PC but not on my phone, because `localhost` on the phone points to the phone itself, not to my PC.

**How I solved it:** I found my PC's IP address with `ipconfig`, and changed the API URL in `app.js` to use `window.location.hostname`, so it always points to the machine that served the page. I also connected the phone to the same WiFi and allowed Node.js through the Windows Firewall.

### 3. The .env file

**The problem:** I was confused about the difference between `.env` and `.env.example`. At first I also put `.env.example` in the wrong folder (the project root instead of `backend`).

**How I solved it:** I learned that `.env` holds my real database password and stays only on my computer, and it is never submitted. `.env.example` is a template without a password, and it lives in `backend` next to `.env` so anyone who opens the project knows which variables to fill in.
