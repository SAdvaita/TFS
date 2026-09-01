import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for web frontend (localhost:5173 / any origin in development) and mobile
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Serve static assets (e.g. logo)
const assetsDir = path.join(process.cwd(), '..', 'assets');
app.use('/assets', express.static(assetsDir));

// API Routes
app.use('/api', apiRouter);

// Root landing endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TRUE FIRE SOLUTION (TFS) - Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 40px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); border: 1px solid #334155; max-width: 500px; }
          h1 { color: #ef4444; margin: 0 0 10px 0; font-size: 24px; font-weight: 900; }
          .status { display: inline-flex; align-items: center; background: #064e3b; color: #34d399; font-weight: bold; font-size: 12px; padding: 6px 16px; border-radius: 9999px; margin-top: 15px; }
          .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 8px; }
          p { color: #94a3b8; font-size: 14px; margin: 15px 0 0 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>TRUE FIRE SOLUTION</h1>
          <div style="color: #fbbf24; font-size: 12px; font-weight: bold; letter-spacing: 2px;">BACKEND API SERVER</div>
          <div class="status"><div class="dot"></div>API SERVICE IS LIVE & HEALTHY</div>
          <p>This is the cloud backend API server for TFS Invoicing, Customers, and Android Mobile Sync.</p>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'TFS Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  TRUE FIRE SOLUTION (TFS) BACKEND API  `);
  console.log(`  Running on http://localhost:${PORT}     `);
  console.log(`=========================================`);
});
