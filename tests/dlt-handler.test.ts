import { DLTHandler } from '../src/dlt-handler';

describe('DLTHandler', () => {
  let handler: DLTHandler;

  beforeEach(() => {
    handler = new DLTHandler();
  });

  test('should lock asset successfully', () => {
    const lock = handler.lockAsset('TRADE-001', 'ASSET-123', 100);

    expect(lock.status).toBe('LOCKED');
    expect(lock.tradeId).toBe('TRADE-001');
    expect(lock.assetId).toBe('ASSET-123');
    expect(lock.quantity).toBe(100);
    expect(lock.txId).toBeDefined();
  });

  test('should retrieve locked asset status', () => {
    handler.lockAsset('TRADE-001', 'ASSET-123', 100);
    const status = handler.getAssetLockStatus('TRADE-001');

    expect(status).toBeDefined();
    expect(status?.status).toBe('LOCKED');
  });

  test('should release locked asset', () => {
    handler.lockAsset('TRADE-001', 'ASSET-123', 100);
    const release = handler.releaseAsset('TRADE-001');

    expect(release).toBeDefined();
    expect(release?.status).toBe('RELEASED');

    const statusAfterRelease = handler.getAssetLockStatus('TRADE-001');
    expect(statusAfterRelease).toBeUndefined();
  });

  test('should return null when releasing non-existent lock', () => {
    const release = handler.releaseAsset('NON-EXISTENT');
    expect(release).toBeNull();
  });
});
