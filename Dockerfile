FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies for canvas build
RUN apk add --no-cache --virtual .build-deps \
    build-base gcc g++ make python3 py3-pip pkgconfig \
    cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev \
    libjpeg-turbo-dev freetype-dev fontconfig-dev \
    && npm install \
    && apk add --no-cache \
    cairo pango jpeg giflib pixman libjpeg-turbo freetype fontconfig \
    && apk del .build-deps

COPY . .

# Create storage directories
RUN mkdir -p /app/storage/qr_codes /app/storage/pdfs /app/storage/pdf_pngs
RUN chown -R node:node /app/storage && chmod -R 700 /app/storage

CMD ["node", "backend/server.js"]
