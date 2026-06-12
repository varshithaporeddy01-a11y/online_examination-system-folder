# OES Permanent Deployment

The app is now deployment-ready for a public host.

## Recommended Simple Option: Railway

1. Create a GitHub repository and push this project.
2. Go to Railway and create a new project from the GitHub repo.
3. Add a MySQL service in the same Railway project.
4. Open the MySQL service and import `schema.sql`.
5. Add these variables to the Node service:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
6. Deploy. Railway will run `npm start`.

## Strong Free-Database Option: Render + Aiven MySQL

1. Create an Aiven MySQL service.
2. Import `schema.sql` into Aiven MySQL.
3. Push this project to GitHub.
4. Create a Render Web Service from the GitHub repo.
5. Use:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health path: `/api/health`
6. Add the environment variables from `.env.example`.

## Important

- Do not upload `.env`.
- Use a new long random `JWT_SECRET` in production.
- Your current local MySQL data is not automatically online. Import `schema.sql`, then create demo users/questions/exams from the app.
