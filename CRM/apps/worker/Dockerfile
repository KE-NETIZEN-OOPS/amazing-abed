FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY packages/*/package*.json ./packages/*/

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
