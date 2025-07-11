FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Create storage directories
RUN mkdir -p /app/storage/qr_codes /app/storage/pdfs /app/storage/pdf_pngs
RUN chown -R node:node /app/storage && chmod -R 700 /app/storage

CMD ["node", "backend/server.js"]
