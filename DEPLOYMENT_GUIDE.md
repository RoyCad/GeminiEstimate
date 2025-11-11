# Project Deployment Guide for Firebase Hosting

This guide provides the necessary steps and commands to deploy your Next.js application to Firebase Hosting.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js and npm (or yarn)
- A Firebase account

## Deployment Steps

Follow these steps in your terminal from the root directory of the project.

### 1. Install the Firebase CLI

If you don't have the Firebase Command Line Interface (CLI) installed, run the following command. This tool allows you to interact with your Firebase project.

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

Next, you need to authenticate with your Firebase account. This command will open a new browser window for you to log in.

```bash
firebase login
```

### 3. Build the Application for Production

Your Next.js application needs to be compiled and exported as a static site, which is optimized for production. The project is already configured to handle this. Run the following command:

```bash
npm run build
```
This command executes `next build && next export`, which creates a production-ready `out` directory.

### 4. Deploy to Firebase Hosting

Finally, deploy the contents of the `out` directory to your Firebase Hosting site. The `firebase.json` file is already configured to serve from this directory.

Run the following command to deploy:

```bash
firebase deploy --only hosting
```

After the command completes successfully, it will provide you with the hosting URL where your application is now live. Your application is configured to be hosted at **geminiestimate.web.app**.
