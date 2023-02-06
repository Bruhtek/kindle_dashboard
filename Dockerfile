FROM node:18

WORKDIR /app

COPY package*.json ./

COPY . .

RUN yarn install
RUN yarn run build

EXPOSE 3000

CMD [ "yarn", "run", "start" ]