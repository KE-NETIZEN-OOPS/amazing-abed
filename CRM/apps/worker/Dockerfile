FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/worker/package*.json ./apps/worker/
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

# Build worker
WORKDIR /app/apps/worker
RUN npm run build

CMD ["npm", "run", "start"]
