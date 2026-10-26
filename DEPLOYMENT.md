# Deployment Guide

## Local Development

### Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Server runs on http://localhost:3000
```

### Development with Docker

```bash
# Build Docker image
docker build -t dlt-target-bridge:dev .

# Run container
docker run -p 3000:3000 dlt-target-bridge:dev

# Or use docker-compose with callback receiver
docker-compose up -d
```

## Production Deployment

### Environment Variables

Create `.env` file:

```bash
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

### Docker Deployment

#### Single Container

```bash
# Build production image
docker build -t dlt-target-bridge:1.0.0 .

# Run with environment
docker run \
  -d \
  --name dlt-target-bridge \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --restart unless-stopped \
  dlt-target-bridge:1.0.0
```

#### Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f dlt-target-bridge

# Stop services
docker-compose down
```

### Kubernetes Deployment

#### Create Deployment YAML

```yaml
# dlt-target-bridge-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dlt-target-bridge
  labels:
    app: dlt-target-bridge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dlt-target-bridge
  template:
    metadata:
      labels:
        app: dlt-target-bridge
    spec:
      containers:
      - name: dlt-target-bridge
        image: dlt-target-bridge:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: dlt-target-bridge-service
spec:
  selector:
    app: dlt-target-bridge
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

#### Deploy to Kubernetes

```bash
# Apply deployment
kubectl apply -f dlt-target-bridge-deployment.yaml

# Check deployment status
kubectl get deployment dlt-target-bridge
kubectl get pods -l app=dlt-target-bridge

# View logs
kubectl logs -l app=dlt-target-bridge -f

# Port forward for testing
kubectl port-forward svc/dlt-target-bridge-service 3000:80
```

### Cloud Platforms

#### AWS (ECS/Fargate)

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag dlt-target-bridge:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/dlt-target-bridge:1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/dlt-target-bridge:1.0.0

# Create ECS task definition and service via AWS Console or CLI
aws ecs create-task-definition \
  --family dlt-target-bridge \
  --container-definitions file://ecs-task-definition.json
```

#### Google Cloud (Cloud Run)

```bash
# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/<project-id>/dlt-target-bridge:1.0.0

# Deploy to Cloud Run
gcloud run deploy dlt-target-bridge \
  --image gcr.io/<project-id>/dlt-target-bridge:1.0.0 \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated
```

#### Azure Container Instances

```bash
# Push to ACR
az acr build --registry <registry-name> --image dlt-target-bridge:1.0.0 .

# Deploy container instance
az container create \
  --resource-group <resource-group> \
  --name dlt-target-bridge \
  --image <registry-name>.azurecr.io/dlt-target-bridge:1.0.0 \
  --ports 3000 \
  --cpu 1 --memory 1
```

### Heroku Deployment

```bash
# Create Procfile
echo "web: npm start" > Procfile

# Push to Heroku
heroku create dlt-target-bridge
git push heroku main

# View logs
heroku logs --tail
```

## Monitoring & Logging

### Health Checks

The service exposes health endpoint:

```bash
curl http://localhost:3000/api/health
```

### Application Logs

Development:
```bash
npm run dev
```

Production (Docker):
```bash
docker logs -f dlt-target-bridge
```

### Structured Logging (Optional Enhancement)

Add structured logging for production:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Database Integration

For production, add persistence:

### PostgreSQL Setup

```javascript
// In settlement-system.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Replace in-memory Map with database queries
```

### MongoDB Setup

```javascript
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI);

// Define schemas for TradeState, PaymentSettlement, etc.
```

## Load Testing

Test with Apache Bench:

```bash
# Single request
ab -n 100 -c 10 http://localhost:3000/api/health

# POST request
ab -n 100 -c 10 -p payload.json -T application/json http://localhost:3000/api/trades
```

Test with k6:

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 100 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  let response = http.post('http://localhost:3000/api/trades', {
    assetId: 'ASSET-123',
    quantity: 100,
    settlementAmount: 50000,
    currency: 'EUR',
    counterpartyDltAddress: '0xABC',
    callbackUrl: 'http://localhost:3001/callback',
  });

  check(response, {
    'status is 201': (r) => r.status === 201,
  });
}
```

Run: `k6 run load-test.js`

## Security

### HTTPS/TLS

Use reverse proxy (nginx/Caddy):

```nginx
# nginx.conf
upstream dlt_bridge {
    server localhost:3000;
}

server {
    listen 443 ssl;
    server_name api.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://dlt_bridge;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### API Authentication

Add API key middleware:

```typescript
// In routes.ts
const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.post('/trades', apiKeyMiddleware, async (req, res) => {
  // ... trade logic
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
});

app.use('/api/', limiter);
```

## Backup & Recovery

### Trade Data Backup

```bash
# If using PostgreSQL
pg_dump -h localhost -U user dbname > backup.sql

# Restore
psql -h localhost -U user dbname < backup.sql
```

## Scaling

### Horizontal Scaling

With load balancer (nginx):

```nginx
upstream dlt_bridge {
    server instance1:3000;
    server instance2:3000;
    server instance3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://dlt_bridge;
    }
}
```

### Vertical Scaling

Increase container resources:

```bash
# Docker
docker run -m 2G --cpus 2 dlt-target-bridge:1.0.0

# Kubernetes
resources:
  requests:
    memory: "2Gi"
    cpu: "2"
  limits:
    memory: "4Gi"
    cpu: "4"
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs dlt-target-bridge

# Run with interactive shell
docker run -it dlt-target-bridge:1.0.0 /bin/sh
```

### Port conflicts

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database connection issues

```bash
# Test connection
psql -h <host> -U <user> -d <database>
```

---

For more detailed information, see [README.md](./README.md)
