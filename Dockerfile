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

# Railway requires PORT env var - use shell form to expand env vars
ENV PORT=8080
EXPOSE 8080

# Start server
CMD node server.js
