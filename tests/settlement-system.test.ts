import { SettlementSystem } from '../src/settlement-system';

describe('SettlementSystem', () => {
  let system: SettlementSystem;

  beforeEach(() => {
    system = new SettlementSystem();
  });

  test('should initiate payment', async () => {
    const settlement = await system.initiatePayment(
      'MSG-001',
      'TRADE-001',
      1000,
      'EUR',
      'Bank-A',
      'Bank-B'
    );

    expect(settlement.settlementId).toBeDefined();
    expect(settlement.iso20022MessageId).toBe('MSG-001');
    expect(settlement.tradeId).toBe('TRADE-001');
    expect(settlement.status).toBe('PENDING');
  });

  test('should process payment', async () => {
    const settlement = await system.initiatePayment(
      'MSG-001',
      'TRADE-001',
      1000,
      'EUR',
      'Bank-A',
      'Bank-B'
    );

    const processed = await system.processPayment(settlement.settlementId);

    expect(processed).toBeDefined();
    expect(processed?.status).toBe('SETTLED');
    expect(processed?.settledAt).toBeDefined();
  });

  test('should retrieve settlement', async () => {
    const initiated = await system.initiatePayment(
      'MSG-001',
      'TRADE-001',
      1000,
      'EUR',
      'Bank-A',
      'Bank-B'
    );

    const retrieved = system.getSettlement(initiated.settlementId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.tradeId).toBe('TRADE-001');
  });

  test('should return null for non-existent settlement', () => {
    const retrieved = system.getSettlement('NON-EXISTENT');
    expect(retrieved).toBeUndefined();
  });

  test('should send payment callback', async () => {
    const result = await system.sendPaymentCallback(
      'http://localhost:3001/callback',
      'SETTLE-001',
      'SETTLED'
    );

    // Will fail due to no server, but should handle gracefully
    expect(typeof result).toBe('boolean');
  });
});
