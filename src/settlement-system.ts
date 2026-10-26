import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { PaymentSettlement } from './types';

export class SettlementSystem {
  private settlements: Map<string, PaymentSettlement> = new Map();

  async initiatePayment(
    messageId: string,
    tradeId: string,
    amount: number,
    currency: string,
    debtor: string,
    creditor: string
  ): Promise<PaymentSettlement> {
    const settlementId = `SETTLE-${uuidv4()}`;

    const settlement: PaymentSettlement = {
      settlementId,
      iso20022MessageId: messageId,
      tradeId,
      amount,
      currency,
      debtor,
      creditor,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.settlements.set(settlementId, settlement);
    console.log(`[Settlement] Payment initiated: ${settlementId} for trade ${tradeId}`);
    return settlement;
  }

  async processPayment(settlementId: string): Promise<PaymentSettlement | null> {
    const settlement = this.settlements.get(settlementId);
    if (!settlement) {
      return null;
    }

    settlement.status = 'PROCESSING';
    console.log(`[Settlement] Processing payment: ${settlementId}`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    settlement.status = 'SETTLED';
    settlement.settledAt = new Date().toISOString();
    this.settlements.set(settlementId, settlement);

    console.log(`[Settlement] Payment settled: ${settlementId} (${settlement.amount} ${settlement.currency})`);
    return settlement;
  }

  async sendPaymentCallback(callbackUrl: string, settlementId: string, status: string): Promise<boolean> {
    try {
      const response = await axios.post(callbackUrl, {
        settlementId,
        status,
        timestamp: new Date().toISOString(),
      }, {
        timeout: 5000,
      });
      console.log(`[Settlement] Callback sent to ${callbackUrl} with status ${status}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error(`[Settlement] Callback failed for ${callbackUrl}:`, error);
      return false;
    }
  }

  getSettlement(settlementId: string): PaymentSettlement | undefined {
    return this.settlements.get(settlementId);
  }

  getSettlementsByTrade(tradeId: string): PaymentSettlement[] {
    return Array.from(this.settlements.values()).filter((s) => s.tradeId === tradeId);
  }
}
