# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Clear npm cache and ensure clean environment
RUN npm cache clean --force && rm -rf node_modules package-lock.json

# Copy package files
COPY package*.json ./

# Install dependencies with retry logic and clean install
RUN npm ci --prefer-offline --no-audit --verbose

# Verify package integrity
RUN npm audit --audit-level=moderate || true

# Copy source code
COPY . .

# Clean any existing build artifacts
RUN rm -rf dist

# Build the application with increased memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Verify build output
RUN ls -la dist/

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]