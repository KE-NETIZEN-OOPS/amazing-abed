FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/infra/prisma
RUN npx prisma generate

# Build API
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
