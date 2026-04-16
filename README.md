# Xeneport Frontend

Xeneport is an application for a portfolio drift monitoring platform built for long-term investors.

The product helps users:

- Track portfolio holdings
- Monitor allocation across assets
- Detect drift when a position grows beyond a defined tolerance
- Review alerts and portfolio-level insights

This is a decision-support product. It does not execute trades or connect to a broker for order placement.

## What The App Does

The frontend provides the investor-facing experience for:

- Account registration and login
- Email OTP verification
- Portfolio creation and portfolio management
- Holdings management
- Drift monitoring
- Alert review
- Basic analytics views
- Profile/settings management

The core product flow is:

`Track -> Calculate -> Detect -> Alert -> Review`

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Router

## Prerequisites

Before running the frontend locally, make sure you have:

- Node.js 18+ installed
- npm installed
- The backend API running locally

## Local Setup

1. Clone the repository.
2. Open the `xeneport` folder.
3. Install dependencies:

```bash
npm install
```

4. Create a local environment file from the example:

```bash
cp .env.example .env
```

If you are on Windows PowerShell, create `.env` manually and copy the value from `.env.example`.

5. Confirm the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

6. Start the development server:

```bash
npm run dev
```

The frontend is configured to run locally on:

`http://localhost:8080`

## Backend Requirement

The frontend expects a running API that supports:

- Authentication
- User profile
- Portfolios
- Holdings
- Allocation data
- Drift status
- Alerts
- Searchable securities

By default, the frontend points to:

`http://localhost:3000/api`

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
```

## Production Notes

For deployment, set `VITE_API_BASE_URL` to the public backend URL for the environment where the frontend is hosted.

Typical deployment flow:

- Frontend on Vercel
- Backend on Render
- Database hosted separately

## Current Scope

This frontend is aligned to the MVP product scope. Some advanced or historical analytics sections may remain limited or marked as coming soon depending on backend availability.

## License

Pending