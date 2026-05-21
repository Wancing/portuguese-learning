# Portuguese Learning Platform

A full-stack European Portuguese learning app built to help learners browse useful phrases by category, listen to native-style audio, and practice real-world vocabulary in a clean, mobile-friendly interface. The project is deployed on Railway with a separate MySQL service and a public Railway domain, using the common GitHub-repo-to-Railway workflow and Railway public networking.[1][2][3][4]

## Live Demo

[View the live app](https://portuguese-learning-production.up.railway.app)

## Overview

This project was built as a portfolio-ready language learning product focused on practical European Portuguese phrases for everyday situations such as greetings, shopping, travel, food, and social interactions. Railway supports deploying Node.js apps from GitHub repositories, attaching environment variables, and exposing services through a generated public domain, which matches the deployment setup used for this app.[1][2][3][4]

The app currently includes seeded phrase categories and phrase detail pages, and it was deployed alongside a Railway MySQL database. Railway’s MySQL docs describe connecting another service in the same project through MySQL-provided variables such as `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, and `MYSQL_URL`, which aligns with how the app database connection was configured during deployment.[5][6]

## Features

- Browse phrases by category, including greetings, shopping, travel, food, and social situations.
- View Portuguese phrases alongside English translations.
- Open individual phrase pages for focused practice.
- Play native audio for pronunciation support.
- Use a responsive full-stack web app deployed to the public web through Railway public networking.[4]
- Seed the database with starter content for a ready-to-demo portfolio project.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, tRPC |
| Database | MySQL, Drizzle ORM |
| Deployment | Railway, GitHub |
| Styling/UI | Custom UI components, modern responsive layout |

## Screenshots

Add screenshots or a short GIF here after polishing the UI.

```md
![Home page](./docs/homepage.png)
![Phrase detail](./docs/phrase-detail.png)
```

## Project Structure

```bash
.
├── client/
├── server/
├── shared/
├── seed-db.mjs
├── package.json
└── README.md
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Wancing/portuguese-learning.git
cd portuguese-learning
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the database connection values your app expects.

Example:

```env
DATABASE_URL=mysql://root:password@localhost:3306/railway
NODE_ENV=development
PORT=5000
```

### 4. Run the app

```bash
pnpm dev
```

### 5. Seed the database

```bash
node seed-db.mjs
```

## Deployment

This project is deployed on Railway using a GitHub-connected Node.js service and a separate Railway MySQL service. Railway documents this GitHub deployment flow for Node.js apps and documents public domain generation through the service Settings → Networking flow.[1][2][3][4]

### Railway setup summary

1. Push the project to GitHub.
2. Create a new Railway project from the GitHub repository.
3. Add a MySQL service to the same Railway project.
4. Configure environment variables for the app service.
5. Generate a public Railway domain in the service settings.[2][3][4]

### Production environment variables

```env
DATABASE_URL=your-mysql-connection-string
NODE_ENV=production
PORT=5000
```

If using Railway reference variables, Railway supports explicit database reference variables so one service can consume values from a database service in the same project.[6][5]

## Why this project matters

This app is more than a CRUD demo. It shows end-to-end product development across frontend UI, backend APIs, database setup, seeded content, debugging, and cloud deployment, all inside a practical language-learning use case that is easy for recruiters and hiring managers to understand.

It also creates a strong base for adding AI features such as grammar feedback, an AI tutor, or personalized exercise generation. That makes it a good foundation for evolving from a full-stack portfolio project into an AI-focused portfolio project.

## Roadmap

- Add AI-powered grammar feedback for learner-written Portuguese sentences.
- Add personalized exercise generation based on learner mistakes.
- Add user accounts and saved progress.
- Add pronunciation recording and AI feedback improvements.
- Expand the phrase library and category coverage.
- Improve analytics and learner progress tracking.

## Lessons Learned

- Deployment is easier when the application and database live in the same Railway project and use explicit environment variable references for database connection values.[6][5]
- Railway public networking makes it fast to turn a project into a shareable live demo with a hosted `.railway.app` domain.[4]
- A narrow, polished feature set is often better for portfolio impact than a broad unfinished product.

## Credits

Built by [Wancing](https://github.com/Wancing) as a portfolio project focused on full-stack development and language learning product design.

## License

MIT License

