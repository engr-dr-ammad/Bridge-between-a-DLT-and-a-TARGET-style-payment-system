import express from 'express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'DLT-TARGET Bridge Service',
    version: '1.0.0',
    description: 'REST service bridging Distributed Ledger Technology with TARGET-style payment settlement',
    endpoints: {
      health: 'GET /api/health',
      initiateTrade: 'POST /api/trades',
      getTrade: 'GET /api/trades/:tradeId',
      listTrades: 'GET /api/trades',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   DLT-TARGET Bridge Service Started            ║
║   Version: 1.0.0                               ║
║   Port: ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
╚════════════════════════════════════════════════╝

Available Endpoints:
  Root:       http://localhost:${PORT}/
  Health:     http://localhost:${PORT}/api/health
  Trades:     http://localhost:${PORT}/api/trades
  Trade by ID: http://localhost:${PORT}/api/trades/{tradeId}
  `);
});

export default server;
