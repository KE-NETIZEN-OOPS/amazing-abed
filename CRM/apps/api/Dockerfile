FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
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

# Build shared packages required by API runtime.
WORKDIR /app/packages/auth
RUN npm run build

WORKDIR /app/packages/reddit-adapter
RUN npm run build

WORKDIR /app/packages/llm-adapter
RUN npm run build

WORKDIR /app/packages/nlp
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
