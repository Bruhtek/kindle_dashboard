FROM node:18-bullseye-slim

LABEL org.opencontainers.image.source=https://github.com/Bruhtek/kindle_dashboard

WORKDIR /app

COPY package*.json ./
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium

RUN apt-get update && \
    apt-get install -y wget gnupg && \
    apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
        libgtk2.0-0 libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1 libasound2 && \
    apt-get install -y chromium && \
    apt-get clean


RUN yarn install
RUN yarn build


EXPOSE 3000

CMD [ "yarn", "start" ]
