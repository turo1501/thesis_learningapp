FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client app
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"] 