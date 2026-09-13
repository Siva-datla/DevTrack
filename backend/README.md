# DevTrack Backend

This directory contains the Node.js/Express.js backend and PostgreSQL data access layer for the DevTrack platform.

## Directory Structure

```text
backend/
├── src/
│   ├── config/              # App & DB configuration, env helpers
│   ├── controllers/         # HTTP request handlers
│   ├── routes/              # Express route definitions
│   ├── middleware/          # Auth, validation, and error middleware
│   ├── services/            # Core business logic
│   │   └── platforms/       # Platform integrations (Codeforces, LeetCode, etc.)
│   ├── repositories/        # Direct SQL queries and DB queries
│   ├── jobs/                # Background sync jobs and schedulers
│   ├── validators/          # Payload validation schemas
│   ├── utils/               # Shared helpers and response formatters
│   ├── db/                  # PostgreSQL pool and migration scripts
│   ├── app.js               # Express application initialization & middleware
│   └── server.js            # Server entry point
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules for backend
├── package.json             # NPM dependencies and scripts
└── README.md
```

## Setup & Running

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev

# Run in production
npm start
```
