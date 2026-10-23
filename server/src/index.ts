import { app } from './app.js';
import { config } from './config.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛡️  TrustLens AI Server active`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚙️  Environment: ${config.nodeEnv}`);
  console.log(
    `🤖 Gemini AI: ${
      config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here'
        ? 'Enabled (Backend API Key Configured)'
        : 'Disabled (Running in Local Rules-Only Mode)'
    }`
  );
  console.log(`===============================================`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down TrustLens server...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
