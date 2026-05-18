# ── Stage 1: Build the React frontend ────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Copy root package files and install React/Vite dependencies
COPY package*.json ./
RUN npm ci

# Copy source files needed for the build
COPY vite.config.js ./
COPY index.html ./
COPY src/ ./src/

# Build React app → output goes to server/public/
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────────────────
FROM node:20-slim AS production

WORKDIR /app/server

# Copy server package files and install only production dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy the Express server source files
COPY server/ ./

# Copy the built React assets from the build stage
COPY --from=builder /app/server/public ./public

# Cloud Run sets PORT automatically; default to 8080
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
