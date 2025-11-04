# Stage 1 — Build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run npx 
RUN npx prisma generate

# Build the project (Nest compiles TypeScript -> JavaScript)
RUN npm run build

# Stage 2 — Run the app
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Install ALL dependencies (not omitting dev)
COPY .env ./
COPY package*.json ./
RUN npm ci

# Copy full source (not just dist)
COPY . .

RUN npx prisma generate

# Expose port
EXPOSE 3001

# Run in dev mode
CMD ["npm", "run", "start:dev"]

