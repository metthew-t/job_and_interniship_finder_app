# Production Dockerfile for Backend Deployment
FROM node:18-slim

# Set working directory to the backend folder
WORKDIR /app/backend

# Copy package files from the backend subdirectory
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY backend/ ./

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
