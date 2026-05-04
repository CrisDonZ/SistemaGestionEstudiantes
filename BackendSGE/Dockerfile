FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
EXPOSE 4000
CMD npx prisma migrate deploy && npm run dev