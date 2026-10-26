export interface ISO20022PaymentInitiation {
  messageId: string;
  creationTimestamp: string;
  debtor: {
    name: string;
    account: string;
    bankCode: string;
  };
  creditor: {
    name: string;
    account: string;
    bankCode: string;
  };
  amount: number;
  currency: string;
  executionDate: string;
  purpose: string;
  reference: string;
}

export interface DLTTradeRequest {
  tradeId: string;
  assetId: string;
  quantity: number;
  settlementAmount: number;
  currency: string;
  counterpartyDltAddress: string;
  callbackUrl: string;
}

export interface TradeState {
  tradeId: string;
  assetId: string;
  quantity: number;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'ASSET_LOCKED' | 'PAYMENT_SETTLED' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  paymentMessageId?: string;
  assetLockTxId?: string;
  paymentSettlementId?: string;
}

export interface PaymentSettlement {
  settlementId: string;
  iso20022MessageId: string;
  tradeId: string;
  amount: number;
  currency: string;
  debtor: string;
  creditor: string;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
  createdAt: string;
  settledAt?: string;
}

export interface AssetLockEvent {
  txId: string;
  tradeId: string;
  assetId: string;
  quantity: number;
  status: 'LOCKED' | 'RELEASED' | 'FAILED';
  timestamp: string;
}
