# Theresse Food Menu

This version keeps the same React design and features, but the displayed data is now loaded from an Aiven MySQL database through the Express API.

## Setup

1. Copy `.env.example` to `.env`.
2. Put your Aiven MySQL host, port, username, password, and database name in `.env`.
3. Run `npm install`.
4. Run `npm run build`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

The server automatically creates the needed tables if they do not exist. You can also import `database.sql` into Aiven manually.

## Database-backed data

- Menu items
- Orders and order items
- Wallet balance
- Wallet transactions

Login remains demo mode, so the original login design and behavior are unchanged.
