FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js
WORKDIR /app/apps/web
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/package*.json ./
COPY --from=builder /app/apps/web/next.config.js ./

EXPOSE 3000

CMD ["npm", "run", "start"]
