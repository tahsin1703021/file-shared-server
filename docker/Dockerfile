# Use official Node.js image
FROM node:lts-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose port (change if your app uses another)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
