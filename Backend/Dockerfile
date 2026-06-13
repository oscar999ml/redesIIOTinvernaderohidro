FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4001 4002
CMD ["node", "--experimental-sqlite", "src/index.js"]
