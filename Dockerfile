FROM node:18-alpine

LABEL org.opencontainers.image.source=https://github.com/Bruhtek/kindle_dashboard

WORKDIR /app

COPY package*.json ./
COPY . .

RUN yarn install
RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]
