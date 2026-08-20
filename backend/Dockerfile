# =========================
# SmartSpace ERP Backend
# =========================

FROM node:20-bookworm-slim

WORKDIR /app

# Prisma requires OpenSSL
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy backend source
COPY . .

# Generate Prisma Client inside the same Linux environment
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]