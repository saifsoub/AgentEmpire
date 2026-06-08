FROM node:20-alpine

# Baileys needs python/make/g++ for some native deps (libsignal-node)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY index.js ./

CMD ["node", "index.js"]
