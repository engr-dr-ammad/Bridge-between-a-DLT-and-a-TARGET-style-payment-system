import { ISO20022Generator } from '../src/iso20022';

describe('ISO20022Generator', () => {
  let generator: ISO20022Generator;

  beforeEach(() => {
    generator = new ISO20022Generator();
  });

  test('should generate valid payment initiation message', () => {
    const payment = generator.generatePaymentInitiation(
      'Bank-A',
      'DE89370400440532013000',
      'DEUTDEFF500',
      'Bank-B',
      'IT60X0542811101000000123456',
      'IRVTIT2B',
      1000,
      'EUR',
      'TRADE-123'
    );

    expect(payment.messageId).toBeDefined();
    expect(payment.messageId).toMatch(/^MSG-/);
    expect(payment.debtor.name).toBe('Bank-A');
    expect(payment.creditor.name).toBe('Bank-B');
    expect(payment.amount).toBe(1000);
    expect(payment.currency).toBe('EUR');
  });

  test('should serialize to valid XML', () => {
    const payment = generator.generatePaymentInitiation(
      'Bank-A',
      'DE89370400440532013000',
      'DEUTDEFF500',
      'Bank-B',
      'IT60X0542811101000000123456',
      'IRVTIT2B',
      1000,
      'EUR',
      'TRADE-123'
    );

    const xml = generator.serializeToXml(payment);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('CstmrCdtTrfInitn');
    expect(xml).toContain(payment.messageId);
    expect(xml).toContain('Bank-A');
    expect(xml).toContain('Bank-B');
    expect(xml).toContain('1000');
  });
});
