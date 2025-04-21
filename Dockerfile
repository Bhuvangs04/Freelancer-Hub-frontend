# Use official Node image
FROM node:18

# Set working directory
WORKDIR /frontend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the port your React app runs on (default: 3000)
EXPOSE 8080

# Start the React app
CMD ["npm", "start"]
