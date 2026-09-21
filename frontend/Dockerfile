# ==========================================
# STAGE 1: Build Image
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build Vite React production bundle
RUN npm run build

# ==========================================
# STAGE 2: Nginx Production Server
# ==========================================
FROM nginx:alpine AS runner

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy cấu hình Nginx tối ưu cho SPA VietRoute
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static bundle từ builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
