FROM node:18-slim

LABEL org.opencontainers.image.source=https://github.com/Bruhtek/kindle_dashboard

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=arm64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package*.json ./
COPY . .

RUN yarn install
RUN yarn build

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
	&& mkdir -p /home/pptruser/Downloads \
	&& chown -R pptruser:pptruser /home/pptruser \
	&& chown -R pptruser:pptruser /app/node_modules \
	&& chown -R pptruser:pptruser /app/package.json \
	&& chown -R pptruser:pptruser /app/package-lock.json

USER pptruser

EXPOSE 3000

CMD [ "yarn", "start" ]
