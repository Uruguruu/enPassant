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

# Expose Port
EXPOSE 3005


#Commands
# Running command : docker run -p 3005:3005  uruguruu/enpassant-:latest
# Build command : docker build -t uruguruu/chess-api .