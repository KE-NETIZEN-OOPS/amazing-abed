# Amazing Abed - Setup Instructions

## Server Deployment

The project has been deployed to the server via SSH. To update:

```bash
ssh boss-server
cd amazing-abed
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Start database and Redis:
```bash
docker-compose up -d postgres redis
```

4. Run Prisma migrations:
```bash
cd infra/prisma
npx prisma migrate dev
npx prisma db seed
```

5. Start services:
```bash
# Terminal 1: API
cd apps/api
npm run dev

# Terminal 2: Worker
cd apps/worker
npm run dev

# Terminal 3: Web
cd apps/web
npm run dev
```

## Features

- ✅ Real Reddit scraping with authentication
- ✅ Multi-account support
- ✅ Real-time frontend updates (20s refresh)
- ✅ Progress tracking with 5min scrape / 2min break cycles
- ✅ NLP intent detection
- ✅ LLM draft generation
- ✅ Full observability dashboard

## Default Account

Username: WonderfulBook9970
Password: Kenya254@_

This account is seeded in the database.
