FROM node:18-alpine

LABEL org.opencontainers.image.source=https://github.com/Bruhtek/kindle_dashboard

WORKDIR /app

COPY package*.json ./
COPY . .

# manually installing chrome
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

# skips puppeteer installing chrome and points to correct binary
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN yarn install
RUN yarn build


EXPOSE 3000

CMD [ "yarn", "start" ]
