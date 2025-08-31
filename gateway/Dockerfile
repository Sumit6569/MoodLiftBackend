# Use Node 20 alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy all project files
COPY . .

# Expose the port your gateway listens on (example: 5000)
EXPOSE 5000

# Start the gateway service
CMD ["node", "index.js"]
