# Amazing Abed - Reddit Lead Intelligence Platform

A comprehensive Reddit scraping and lead generation platform with real-time processing, NLP intent detection, and automated draft reply generation.

## Architecture

- **Monorepo** structure with Turbo
- **Backend**: NestJS API
- **Frontend**: Next.js with App Router
- **Worker**: Background job processing with BullMQ
- **Database**: PostgreSQL with Prisma
- **Scraping**: crawl4ai with real Reddit authentication
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- SSH access to server

### Local Development

```bash
# Install dependencies
npm install

# Start all services
npm run docker:up

# Run development
npm run dev
```

### Server Deployment

```bash
# SSH to server
ssh boss-server

# Navigate to directory
cd amazing-abed

# Start services
docker-compose up -d
```

## Features

- ✅ Real-time Reddit scraping (last 30 minutes)
- ✅ Multi-account support
- ✅ NLP intent detection
- ✅ LLM draft generation
- ✅ Real-time frontend updates
- ✅ Progress tracking
- ✅ Automated scraping cycles (5min scrape, 2min break)
- ✅ Full observability dashboard

## Environment Variables

See `.env.example` in each app directory.
