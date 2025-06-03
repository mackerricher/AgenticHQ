###############################
# 1️⃣  Build & prune stage
###############################
FROM node:18-alpine AS builder
WORKDIR /app

# ---------- install ALL deps (dev + prod) ----------
COPY package*.json .
RUN npm ci --include=dev

# ---------- copy source & build ----------
COPY . .
RUN npm run build

# ---------- keep only production deps ----------
RUN npm prune --omit=dev

###############################
# 2️⃣  Production image
###############################
FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# -- copy minimal runtime payload --
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist

# -- non-root user (no slow recursive chown) --
RUN addgroup -g 1001 -S nodejs \
 && adduser  -S agentichq -u 1001
USER agentichq

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]
