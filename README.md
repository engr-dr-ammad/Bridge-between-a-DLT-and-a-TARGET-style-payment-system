# DLT-TARGET Bridge Service

A REST API service that bridges Distributed Ledger Technology (DLT) systems with TARGET-style payment settlement infrastructure. It orchestrates atomic trades: locking assets on the DLT, settling payments in a simulated central-bank payment system, and releasing assets upon successful settlement using ISO 20022 payment messages.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DLT-TARGET Bridge                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐              │
│  │   DLT Handler    │      │ Settlement System│              │
│  │  (Asset Locking) │      │ (Payment Flow)   │              │
│  └─────────┬────────┘      └────────┬─────────┘              │
│            │                        │                         │
│            └────────┬───────────────┘                        │
│                     │                                        │
│        ┌────────────▼────────────┐                           │
│        │  Trade Orchestrator     │                           │
│        │  (Atomic Coordination)  │                           │
│        └────────────┬────────────┘                           │
│                     │                                        │
│        ┌────────────▼────────────┐                           │
│        │    ISO 20022 Generator  │                           │
│        │  (Payment Messages)     │                           │
│        └─────────────────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Trade Settlement Flow

1. **Trade Initiation** → POST `/api/trades` with trade details
2. **Asset Locking** → DLT Handler locks the asset on the ledger
3. **Payment Message** → ISO 20022 payment initiation generated
4. **Settlement Processing** → TARGET-style system processes payment
5. **Asset Release** → Upon payment settlement, asset is released via callback
6. **Status Tracking** → Trade state tracked at each step

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Bridge-between-a-DLT-and-a-TARGET-style-payment-system

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test
```

### Running the Service

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The service will start on `http://localhost:3000` (default) or port specified by `PORT` env var.

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "DLT-TARGET Bridge",
  "timestamp": "2026-10-26T10:30:00.000Z"
}
```

### 2. Initiate Trade
```http
POST /api/trades
Content-Type: application/json
```

**Request Body:**
```json
{
  "assetId": "ASSET-12345",
  "quantity": 100,
  "settlementAmount": 50000,
  "currency": "EUR",
  "counterpartyDltAddress": "0xABC123...",
  "callbackUrl": "https://your-system.com/settlement-callback"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "trade": {
    "tradeId": "TRADE-abc123def456",
    "assetId": "ASSET-12345",
    "quantity": 100,
    "amount": 50000,
    "currency": "EUR",
    "status": "COMPLETED",
    "createdAt": "2026-10-26T10:30:00.000Z",
    "updatedAt": "2026-10-26T10:30:05.000Z",
    "assetLockTxId": "TX-abc123...",
    "paymentMessageId": "MSG-def456...",
    "paymentSettlementId": "SETTLE-ghi789..."
  },
  "message": "Trade initiated and processing started"
}
```

### 3. Get Trade Details
```http
GET /api/trades/{tradeId}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "tradeId": "TRADE-abc123def456",
    "assetId": "ASSET-12345",
    "quantity": 100,
    "amount": 50000,
    "currency": "EUR",
    "status": "COMPLETED",
    "createdAt": "2026-10-26T10:30:00.000Z",
    "updatedAt": "2026-10-26T10:30:05.000Z",
    "assetLockTxId": "TX-abc123...",
    "paymentMessageId": "MSG-def456...",
    "paymentSettlementId": "SETTLE-ghi789..."
  }
}
```

### 4. List All Trades
```http
GET /api/trades?status=COMPLETED
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "trades": [
    {
      "tradeId": "TRADE-abc123def456",
      "assetId": "ASSET-12345",
      "quantity": 100,
      "amount": 50000,
      "currency": "EUR",
      "status": "COMPLETED",
      ...
    }
  ]
}
```

## Trade Status States

| Status | Description |
|--------|-------------|
| `INITIATED` | Trade created, awaiting asset lock |
| `ASSET_LOCKED` | Asset successfully locked on DLT |
| `PAYMENT_SETTLED` | Payment processed in settlement system |
| `COMPLETED` | Asset released, trade fully settled |
| `FAILED` | Trade processing failed at any step |

## ISO 20022 Payment Messages

The service generates ISO 20022 pain.001.003.02 compliant payment initiation messages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.003.02">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-12345abc</MsgId>
      <CreDtTm>2026-10-26T10:30:00.000Z</CreDtTm>
      ...
    </GrpHdr>
    <PmtInf>
      <!-- Payment information -->
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
```

## DLT Asset Locking

Assets are locked on the DLT with unique transaction IDs:

```
Transaction ID: TX-abc123def456
Asset: ASSET-12345
Quantity: 100
Status: LOCKED → RELEASED
```

## Settlement System (TARGET-Style)

Simulates central-bank real-time gross settlement (RTGS):

- **Settlement ID**: Unique identifier for each payment settlement
- **Status Flow**: PENDING → PROCESSING → SETTLED
- **Callback**: Async notification to requester upon completion
- **Message ID**: Links ISO 20022 message to settlement

## Callback Mechanism

Upon successful payment settlement, the service sends a callback to the provided URL:

```http
POST {callbackUrl}
Content-Type: application/json

{
  "settlementId": "SETTLE-xyz789",
  "status": "SETTLED",
  "timestamp": "2026-10-26T10:30:05.000Z"
}
```

## Configuration

Set environment variables:

```bash
PORT=3000                 # API port (default: 3000)
NODE_ENV=production       # Environment (development|production)
```

## Testing

Run the comprehensive test suite:

```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
```

Tests cover:
- ISO 20022 message generation and serialization
- DLT asset locking/release
- Settlement system operations
- Trade orchestration flow

## Project Structure

```
.
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── routes.ts                   # API routes
│   ├── types.ts                    # TypeScript interfaces
│   ├── iso20022.ts                 # ISO 20022 message handler
│   ├── dlt-handler.ts              # DLT operations (locking/release)
│   ├── settlement-system.ts        # Payment settlement system
│   └── trade-orchestrator.ts       # Trade coordination logic
├── tests/
│   ├── iso20022.test.ts            # ISO 20022 tests
│   ├── dlt-handler.test.ts         # DLT handler tests
│   └── settlement-system.test.ts   # Settlement system tests
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Example: Complete Trade Flow

```bash
# 1. Start the service
npm run dev

# 2. Initiate a trade
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "GOLD-001",
    "quantity": 50,
    "settlementAmount": 100000,
    "currency": "EUR",
    "counterpartyDltAddress": "0xParty2",
    "callbackUrl": "http://your-system:3001/callback"
  }'

# Response includes: tradeId, status, settlement info

# 3. Check trade status
curl http://localhost:3000/api/trades/TRADE-xyz

# 4. Observe the flow in logs:
# [Trade] Trade initiated: TRADE-xyz
# [DLT] Asset locked: GOLD-001 (qty: 50) for trade TRADE-xyz
# [Settlement] Payment initiated: SETTLE-abc for trade TRADE-xyz
# [Settlement] Payment settled: SETTLE-abc (100000 EUR)
# [DLT] Asset released: GOLD-001 for trade TRADE-xyz
# [Trade] Trade completed successfully: TRADE-xyz
```

## Development

### Add New Features
1. Define types in `src/types.ts`
2. Implement logic in respective modules
3. Add routes in `src/routes.ts`
4. Write tests in `tests/`
5. Build and test: `npm run build && npm test`

### Extend DLT Handler
Modify `src/dlt-handler.ts` to integrate with real DLT:
- Replace simulated locking with actual DLT API calls
- Implement real transaction ID generation
- Add blockchain event listeners

### Extend Settlement System
Modify `src/settlement-system.ts` to integrate with TARGET:
- Connect to TARGET RTGS API
- Implement real payment processing
- Add SWIFT integration for interbank transfers

## Production Deployment

For production use:

1. **Database**: Add persistence (PostgreSQL/MongoDB) instead of in-memory storage
2. **Authentication**: Implement OAuth2/API key authentication
3. **Logging**: Add structured logging (Winston/Pino)
4. **Monitoring**: Add APM (New Relic/DataDog)
5. **Security**: Add rate limiting, input validation, HTTPS
6. **Resilience**: Add circuit breakers, retry logic, idempotency

Example production setup:
```bash
# Build Docker image
docker build -t dlt-target-bridge:1.0.0 .

# Run with environment
docker run -e PORT=3000 -e NODE_ENV=production dlt-target-bridge:1.0.0
```

## Troubleshooting

**Trade stuck in ASSET_LOCKED?**
- Check DLT connectivity
- Verify asset ownership
- Review error logs

**Callback not received?**
- Ensure callback URL is reachable
- Check firewall/network policies
- Verify HTTP POST is allowed

**Payment settlement timeout?**
- Increase timeout in settlement-system.ts
- Check TARGET system status
- Verify bank details in ISO 20022 message

## License

MIT

## Support

For issues or questions:
1. Check logs: `docker logs <container-id>`
2. Review API response error messages
3. Consult ISO 20022 documentation
4. Contact system administrator

---

**Developed by Ammad Aslam with AI-assisted tooling**

Built with TypeScript, Express.js, and ISO 20022 Standards
