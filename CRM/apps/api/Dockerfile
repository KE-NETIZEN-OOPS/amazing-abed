FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/

# Copy package files individually
COPY packages/auth/package*.json ./packages/auth/
COPY packages/reddit-adapter/package*.json ./packages/reddit-adapter/
COPY packages/llm-adapter/package*.json ./packages/llm-adapter/
COPY packages/nlp/package*.json ./packages/nlp/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/infra/prisma
RUN npx prisma generate

EXPOSE 3001

# Run with tsx directly (no build needed)
WORKDIR /app/apps/api
CMD ["npx", "tsx", "src/main.ts"]
