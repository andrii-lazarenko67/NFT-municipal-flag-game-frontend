FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy production env for build
COPY .env.production .env.production

# Build the app
RUN npm run build

# Railway sets PORT env var - default to 3000
ENV PORT=3000

# Expose the port Railway will use
EXPOSE $PORT

# Start server
CMD ["node", "server.js"]
