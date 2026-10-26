import { v4 as uuidv4 } from 'uuid';
import { AssetLockEvent } from './types';

export class DLTHandler {
  private lockedAssets: Map<string, AssetLockEvent> = new Map();

  lockAsset(tradeId: string, assetId: string, quantity: number): AssetLockEvent {
    const txId = `TX-${uuidv4()}`;
    const timestamp = new Date().toISOString();

    const lockEvent: AssetLockEvent = {
      txId,
      tradeId,
      assetId,
      quantity,
      status: 'LOCKED',
      timestamp,
    };

    this.lockedAssets.set(tradeId, lockEvent);
    console.log(`[DLT] Asset locked: ${assetId} (qty: ${quantity}) for trade ${tradeId}`);
    return lockEvent;
  }

  releaseAsset(tradeId: string): AssetLockEvent | null {
    const lock = this.lockedAssets.get(tradeId);
    if (!lock) {
      console.warn(`[DLT] No lock found for trade ${tradeId}`);
      return null;
    }

    const releaseEvent: AssetLockEvent = {
      ...lock,
      status: 'RELEASED',
      timestamp: new Date().toISOString(),
    };

    this.lockedAssets.delete(tradeId);
    console.log(`[DLT] Asset released: ${lock.assetId} for trade ${tradeId}`);
    return releaseEvent;
  }

  getAssetLockStatus(tradeId: string): AssetLockEvent | undefined {
    return this.lockedAssets.get(tradeId);
  }

  verifyAssetOwnership(assetId: string, address: string): boolean {
    // Simulated verification - in real DLT, query the ledger
    console.log(`[DLT] Verifying asset ${assetId} ownership for address ${address}`);
    return true;
  }
}
