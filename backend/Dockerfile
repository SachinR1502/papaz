# Use Node.js LTS (Long Term Support) alpine image for a smaller footprint
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using npm ci with --omit=dev as recommended for production builds
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Create the uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create a non-root user and change ownership of the workdir
RUN addgroup -S nodeuser && adduser -S nodeuser -G nodeuser \
  && chown -R nodeuser:nodeuser /usr/src/app

# Run as non-root user
USER nodeuser

# Healthcheck to ensure the container is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Command to run the application
CMD ["node", "server.js"]
