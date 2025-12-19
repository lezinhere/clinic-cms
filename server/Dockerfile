FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install deps
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN ./node_modules/.bin/prisma generate

EXPOSE 5000

CMD ["npm", "start"]
