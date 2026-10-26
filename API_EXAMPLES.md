# API Usage Examples

Complete examples for testing the DLT-TARGET Bridge API.

## Setup

Start the service:
```bash
npm install
npm run dev
```

Service runs on `http://localhost:3000`

## 1. Health Check

Verify service is running:

```bash
curl -X GET http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "DLT-TARGET Bridge",
  "timestamp": "2026-10-26T10:30:00.000Z"
}
```

## 2. Initiate Simple Trade

Basic trade with EUR settlement:

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "ASSET-12345",
    "quantity": 100,
    "settlementAmount": 50000,
    "currency": "EUR",
    "counterpartyDltAddress": "0xPartyB123",
    "callbackUrl": "http://your-system:3001/settlement-callback"
  }'
```

Response:
```json
{
  "success": true,
  "trade": {
    "tradeId": "TRADE-a1b2c3d4",
    "assetId": "ASSET-12345",
    "quantity": 100,
    "amount": 50000,
    "currency": "EUR",
    "status": "COMPLETED",
    "createdAt": "2026-10-26T10:30:00.000Z",
    "updatedAt": "2026-10-26T10:30:05.000Z",
    "assetLockTxId": "TX-e5f6g7h8",
    "paymentMessageId": "MSG-i9j0k1l2",
    "paymentSettlementId": "SETTLE-m3n4o5p6"
  },
  "message": "Trade initiated and processing started"
}
```

## 3. Trade with Gold Asset

Commodity trade:

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "GOLD-LONDON-001",
    "quantity": 1000,
    "settlementAmount": 65000000,
    "currency": "GBP",
    "counterpartyDltAddress": "0xGoldDealer999",
    "callbackUrl": "https://goldtrader.example.com/confirm"
  }'
```

## 4. Trade with Multiple Currency

US Dollar settlement:

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "CRYPTO-ETH-002",
    "quantity": 50,
    "settlementAmount": 150000,
    "currency": "USD",
    "counterpartyDltAddress": "0xEthereumTrader",
    "callbackUrl": "http://localhost:3001/webhook"
  }'
```

## 5. Retrieve Specific Trade

Get details of a completed trade:

```bash
curl -X GET http://localhost:3000/api/trades/TRADE-a1b2c3d4
```

Response:
```json
{
  "success": true,
  "trade": {
    "tradeId": "TRADE-a1b2c3d4",
    "assetId": "ASSET-12345",
    "quantity": 100,
    "amount": 50000,
    "currency": "EUR",
    "status": "COMPLETED",
    "createdAt": "2026-10-26T10:30:00.000Z",
    "updatedAt": "2026-10-26T10:30:05.000Z",
    "assetLockTxId": "TX-e5f6g7h8",
    "paymentMessageId": "MSG-i9j0k1l2",
    "paymentSettlementId": "SETTLE-m3n4o5p6"
  }
}
```

## 6. List All Trades

Get all trades in the system:

```bash
curl -X GET http://localhost:3000/api/trades
```

Response:
```json
{
  "success": true,
  "count": 3,
  "trades": [
    {
      "tradeId": "TRADE-a1b2c3d4",
      "assetId": "ASSET-12345",
      "quantity": 100,
      "amount": 50000,
      "currency": "EUR",
      "status": "COMPLETED",
      ...
    },
    {
      "tradeId": "TRADE-x9y8z7w6",
      "assetId": "GOLD-LONDON-001",
      "quantity": 1000,
      "amount": 65000000,
      "currency": "GBP",
      "status": "COMPLETED",
      ...
    }
  ]
}
```

## 7. Filter Trades by Status

Get only completed trades:

```bash
curl -X GET "http://localhost:3000/api/trades?status=COMPLETED"
```

Get failed trades:

```bash
curl -X GET "http://localhost:3000/api/trades?status=FAILED"
```

Get asset-locked trades:

```bash
curl -X GET "http://localhost:3000/api/trades?status=ASSET_LOCKED"
```

## 8. Using HTTPie

If you prefer httpie:

```bash
# Initiate trade
http POST http://localhost:3000/api/trades \
  assetId="ASSET-12345" \
  quantity:=100 \
  settlementAmount:=50000 \
  currency="EUR" \
  counterpartyDltAddress="0xPartyB123" \
  callbackUrl="http://localhost:3001/callback"

# Get trade
http GET http://localhost:3000/api/trades/TRADE-a1b2c3d4

# List all trades
http http://localhost:3000/api/trades

# Filter by status
http http://localhost:3000/api/trades status==COMPLETED
```

## 9. Using JavaScript/Node.js

```javascript
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

// Initiate trade
async function initiateTrade() {
  try {
    const response = await axios.post(`${baseURL}/trades`, {
      assetId: 'ASSET-12345',
      quantity: 100,
      settlementAmount: 50000,
      currency: 'EUR',
      counterpartyDltAddress: '0xPartyB123',
      callbackUrl: 'http://localhost:3001/callback'
    });
    console.log('Trade ID:', response.data.trade.tradeId);
    console.log('Status:', response.data.trade.status);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get trade
async function getTrade(tradeId) {
  try {
    const response = await axios.get(`${baseURL}/trades/${tradeId}`);
    console.log('Trade:', response.data.trade);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// List all trades
async function listTrades() {
  try {
    const response = await axios.get(`${baseURL}/trades`);
    console.log('Total trades:', response.data.count);
    response.data.trades.forEach(trade => {
      console.log(`${trade.tradeId}: ${trade.status}`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

initiateTrade();
```

## 10. Using Python

```python
import requests
import json

BASE_URL = 'http://localhost:3000/api'

# Initiate trade
def initiate_trade():
    payload = {
        'assetId': 'ASSET-12345',
        'quantity': 100,
        'settlementAmount': 50000,
        'currency': 'EUR',
        'counterpartyDltAddress': '0xPartyB123',
        'callbackUrl': 'http://localhost:3001/callback'
    }
    
    response = requests.post(f'{BASE_URL}/trades', json=payload)
    if response.status_code == 201:
        trade = response.json()['trade']
        print(f"Trade ID: {trade['tradeId']}")
        print(f"Status: {trade['status']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.json())

# Get trade
def get_trade(trade_id):
    response = requests.get(f'{BASE_URL}/trades/{trade_id}')
    if response.status_code == 200:
        print(json.dumps(response.json()['trade'], indent=2))
    else:
        print(f"Error: {response.status_code}")

# List trades
def list_trades(status=None):
    params = {'status': status} if status else {}
    response = requests.get(f'{BASE_URL}/trades', params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"Total trades: {data['count']}")
        for trade in data['trades']:
            print(f"{trade['tradeId']}: {trade['status']}")
    else:
        print(f"Error: {response.status_code}")

if __name__ == '__main__':
    initiate_trade()
    # list_trades(status='COMPLETED')
```

## 11. Testing with Postman

Import this collection into Postman:

```json
{
  "info": {
    "name": "DLT-TARGET Bridge API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Initiate Trade",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": "http://localhost:3000/api/trades",
        "body": {
          "mode": "raw",
          "raw": "{\"assetId\":\"ASSET-12345\",\"quantity\":100,\"settlementAmount\":50000,\"currency\":\"EUR\",\"counterpartyDltAddress\":\"0xPartyB123\",\"callbackUrl\":\"http://localhost:3001/callback\"}"
        }
      }
    },
    {
      "name": "List Trades",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/trades"
      }
    }
  ]
}
```

## 12. Callback Receiver (for testing)

Simple Node.js callback server:

```javascript
// callback-server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/settlement-callback', (req, res) => {
  console.log('Callback received:', req.body);
  console.log('Timestamp:', new Date().toISOString());
  res.json({ status: 'received' });
});

app.listen(3001, () => {
  console.log('Callback receiver listening on port 3001');
});
```

Run: `node callback-server.js`

Then use `http://localhost:3001/settlement-callback` as callbackUrl.

## Error Responses

### Missing Fields
```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"assetId":"ASSET-123"}'
```

Response (400):
```json
{
  "error": "Missing required fields: assetId, quantity, settlementAmount, currency, counterpartyDltAddress, callbackUrl"
}
```

### Trade Not Found
```bash
curl http://localhost:3000/api/trades/INVALID-TRADE-ID
```

Response (404):
```json
{
  "error": "Trade not found"
}
```

### Invalid Route
```bash
curl http://localhost:3000/api/invalid
```

Response (404):
```json
{
  "error": "Not found",
  "path": "/api/invalid"
}
```

---

For more information, see [README.md](./README.md)
