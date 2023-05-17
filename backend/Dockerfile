# Base image used
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy project files
COPY . .

# Rebuild native addons (including better-sqlite3) for the current platform
RUN npm rebuild

# Running the default command
CMD ["npm", "start"]

# Expose Prot
EXPOSE 3004
