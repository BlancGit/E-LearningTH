// Vercel serverless function entry point
import { createServer } from 'http';
import { parse } from 'url';
import { registerRoutes } from '../server/routes';
import express from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Initialize routes
let server: any = null;

const initializeServer = async () => {
  if (!server) {
    server = await registerRoutes(app);
  }
  return server;
};

export default async function handler(req: any, res: any) {
  await initializeServer();
  
  // Handle the request
  app(req, res);
}