FROM node:16 as builder

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN yarn build
ENV PORT 8080
ENV NODE_ENV production

CMD [ "node", "dist/index.js" ]