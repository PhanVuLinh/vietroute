# ==========================================
# STAGE 1: Build Image
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt công cụ cần thiết cho native modules (nếu có)
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Cài đặt đầy đủ dependencies
RUN npm ci

# Copy source code và Prisma schema
COPY prisma ./prisma/
COPY src ./src/

# Sinh Prisma Client
RUN npx prisma generate

# Build NestJS bundle sang JavaScript
RUN npm run build

# ==========================================
# STAGE 2: Production Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Gán biến môi trường production
ENV NODE_ENV=production
ENV PORT=3001

# Thêm dumb-init để xử lý signals và PID 1
RUN apk add --no-cache dumb-init

# Tạo non-root user để tăng tính bảo mật
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package descriptors và cài đặt CHỈ production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema và generated client từ builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy dist bundle từ builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3001

# Healthcheck định kỳ kiểm tra backend sống
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
