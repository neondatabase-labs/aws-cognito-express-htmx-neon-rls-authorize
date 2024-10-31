# AWS Cognito + Neon Authorize Demo

This is a demo of [Neon Authorize](https://neon.tech/docs/guides/neon-authorize) together with Amazon Web Services' Cognito. This is a minimal app and doesn't exhaustively have all features, but rather just the features neededed to demonstrate how Cognito and Neon Authorize can work together. Namely this app does not have password reset, proper error messaging, or other things necessary for full proper auth support.

# The Stack

- Neon Serverless Postgres (and the serverless driver)
- AWS Cognito
- HTMX
- Node.js
- Express.js

We have other stacks that work with other providers (Next.js, React.js, Nest.js, Solid.js, etc.) if you want other examples. [Checkout the neondatabase-labs org on GitHub](https://github.com/neondatabase-labs?q=authorize).

# Setup

1. Sign up for neon.tech and AWS.
2. Clone this repo
3. Install Node.js 20.6+ as well as npm
4. Run npm install in the directory of this project
5. Create a new Neon.tech project. AWS or Azure works fine. For now it must be Postgres 16 (not 17).
6. Create a new AWS Cognito instance
   1. Choose email for sign-in options
   2. Choose your password policy
   3. No MFA
   4. Account recovery doesn't matter
   5. Don't change any options on the next page
   6. Send email w/ Cognito
   7. Enter a user pool name
   8. Public client
   9. Enter an app name
   10. Don't generate a client secret (or do, but you'll have to add code to handle the secretHash)
   11. Create User Pool
7.  Copy the "Token signing key URL" from the main page of your new Cognito Instance, go to the Neon console of your new project, click "Authorize" in the side bar, add a new provider, and paste the Token signing key URL in there.
8.  When the side drawer opens after you add the key (which can be opened later too), run the top two commands to enable the Postgres extension in Neon.
9.  Copy the SQL in schema.sql and run it in the SQL Editor (or run it via psql).
10. Copy .env.template to .env
11. Get the COGNITO_REGION and COGNITO_CLIENT_ID from your AWS Cognito app you made.
12. Get **authenticated** role connection string from your Neon console. This is different than the neondb_owner string, it does not have an embedded password.
13. Run npm run dev to start your app!