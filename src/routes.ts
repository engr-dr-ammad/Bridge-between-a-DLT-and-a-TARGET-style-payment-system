import { Router, Request, Response } from 'express';
import { TradeOrchestrator } from './trade-orchestrator';
import { DLTTradeRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const orchestrator = new TradeOrchestrator();

router.post('/trades', async (req: Request, res: Response) => {
  try {
    const { assetId, quantity, settlementAmount, currency, counterpartyDltAddress, callbackUrl } = req.body;

    // Validate input
    if (!assetId || !quantity || !settlementAmount || !currency || !counterpartyDltAddress || !callbackUrl) {
      return res.status(400).json({
        error: 'Missing required fields: assetId, quantity, settlementAmount, currency, counterpartyDltAddress, callbackUrl',
      });
    }

    const tradeRequest: DLTTradeRequest = {
      tradeId: `TRADE-${uuidv4()}`,
      assetId,
      quantity: Number(quantity),
      settlementAmount: Number(settlementAmount),
      currency,
      counterpartyDltAddress,
      callbackUrl,
    };

    const trade = await orchestrator.processTradeAndSettlement(tradeRequest);

    res.status(201).json({
      success: true,
      trade,
      message: 'Trade initiated and processing started',
    });
  } catch (error) {
    console.error('Error processing trade:', error);
    res.status(500).json({
      error: 'Failed to process trade',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/trades/:tradeId', (req: Request, res: Response) => {
  try {
    const { tradeId } = req.params;
    const trade = orchestrator.getTrade(tradeId);

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json({ success: true, trade });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve trade',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/trades', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let trades = orchestrator.getAllTrades();

    if (status && typeof status === 'string') {
      trades = trades.filter((t) => t.status === status);
    }

    res.json({
      success: true,
      count: trades.length,
      trades,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve trades',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'DLT-TARGET Bridge',
    timestamp: new Date().toISOString(),
  });
});

export default router;
