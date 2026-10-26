import { DLTHandler } from './dlt-handler';
import { SettlementSystem } from './settlement-system';
import { ISO20022Generator } from './iso20022';
import { DLTTradeRequest, TradeState } from './types';

export class TradeOrchestrator {
  private dltHandler: DLTHandler;
  private settlementSystem: SettlementSystem;
  private iso20022Gen: ISO20022Generator;
  private trades: Map<string, TradeState> = new Map();

  constructor() {
    this.dltHandler = new DLTHandler();
    this.settlementSystem = new SettlementSystem();
    this.iso20022Gen = new ISO20022Generator();
  }

  async processTradeAndSettlement(tradeRequest: DLTTradeRequest): Promise<TradeState> {
    const tradeId = tradeRequest.tradeId;

    // Step 1: Create trade state
    let trade: TradeState = {
      tradeId,
      assetId: tradeRequest.assetId,
      quantity: tradeRequest.quantity,
      amount: tradeRequest.settlementAmount,
      currency: tradeRequest.currency,
      status: 'INITIATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.trades.set(tradeId, trade);
    console.log(`\n[Trade] Trade initiated: ${tradeId}`);

    try {
      // Step 2: Lock asset on DLT
      const assetLock = this.dltHandler.lockAsset(
        tradeId,
        tradeRequest.assetId,
        tradeRequest.quantity
      );
      trade.assetLockTxId = assetLock.txId;
      trade.status = 'ASSET_LOCKED';
      trade.updatedAt = new Date().toISOString();
      this.trades.set(tradeId, trade);

      // Step 3: Generate ISO 20022 payment message
      const paymentMsg = this.iso20022Gen.generatePaymentInitiation(
        'Bank-A',
        'DE89370400440532013000',
        'DEUTDEFF500',
        'Bank-B',
        'IT60X0542811101000000123456',
        'IRVTIT2B',
        tradeRequest.settlementAmount,
        tradeRequest.currency,
        tradeId
      );
      trade.paymentMessageId = paymentMsg.messageId;

      // Step 4: Initiate payment in settlement system
      const settlement = await this.settlementSystem.initiatePayment(
        paymentMsg.messageId,
        tradeId,
        tradeRequest.settlementAmount,
        tradeRequest.currency,
        'Bank-A',
        'Bank-B'
      );
      trade.paymentSettlementId = settlement.settlementId;
      trade.status = 'PAYMENT_SETTLED';
      trade.updatedAt = new Date().toISOString();

      // Step 5: Process the payment
      const processedSettlement = await this.settlementSystem.processPayment(settlement.settlementId);

      if (processedSettlement && processedSettlement.status === 'SETTLED') {
        // Step 6: Release asset on DLT via callback
        const assetRelease = this.dltHandler.releaseAsset(tradeId);
        if (assetRelease) {
          trade.status = 'COMPLETED';
          trade.updatedAt = new Date().toISOString();
          this.trades.set(tradeId, trade);

          // Step 7: Send callback to requester
          await this.settlementSystem.sendPaymentCallback(
            tradeRequest.callbackUrl,
            settlement.settlementId,
            'SETTLED'
          );

          console.log(`[Trade] Trade completed successfully: ${tradeId}\n`);
        }
      }
    } catch (error) {
      trade.status = 'FAILED';
      trade.updatedAt = new Date().toISOString();
      this.trades.set(tradeId, trade);
      console.error(`[Trade] Trade failed: ${tradeId}`, error);
    }

    return trade;
  }

  getTrade(tradeId: string): TradeState | undefined {
    return this.trades.get(tradeId);
  }

  getAllTrades(): TradeState[] {
    return Array.from(this.trades.values());
  }

  getTradesByStatus(status: string): TradeState[] {
    return Array.from(this.trades.values()).filter((t) => t.status === status);
  }
}
