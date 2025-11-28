FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (uses .env.production for VITE_ vars)
RUN npm run build

# Start server - Railway provides PORT env var at runtime
CMD ["node", "server.js"]
