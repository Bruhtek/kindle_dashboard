FROM node:18-alpine

LABEL org.opencontainers.image.source=https://github.com/Bruhtek/kindle_dashboard

WORKDIR /app

COPY package*.json ./
COPY . .

# manually installing chrome
RUN apk add chromium

# skips puppeteer installing chrome and points to correct binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN yarn install
RUN yarn build


EXPOSE 3000

CMD [ "yarn", "start" ]
