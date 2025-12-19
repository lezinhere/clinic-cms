FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy all files first
COPY . .

# Install Node dependencies (Clean install on Linux)
RUN npm install

# Generate Prisma Client (Now using clean Linux binaries)
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
