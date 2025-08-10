# Use Node.js 22 as specified in package.json engines
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 8080 as configured in webpack.config.cjs
EXPOSE 8080

# Start the application in development mode with webpack dev server
# Use -- --host 0.0.0.0 to bind to all interfaces (required for Docker)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
