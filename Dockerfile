FROM node:16 as builder

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN yarn build

CMD [ "node", "dist/index.js" ]