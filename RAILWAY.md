# 🚀 Railway Deployment - Quick Guide

## Railway.app Setup

### 1. Create Project
```bash
railway login
railway init
```

### 2. Add PostgreSQL
```bash
railway add
# Select: PostgreSQL
```

### 3. Set Environment Variables
```bash
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set OPENAI_API_KEY=sk-...
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

### 4. Deploy
```bash
railway up
```

### 5. Generate Domain
```bash
railway domain
# Copy URL: https://pulso-production.up.railway.app
```

### 6. Initialize Database
```bash
railway run psql $DATABASE_URL < database/init.sql
```

## Verify
```bash
curl https://your-app.up.railway.app/health
```

See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
