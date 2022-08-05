FROM node:16 as builder

WORKDIR /usr/src/app

COPY . .
COPY ./assets/fonts/TT-Commons/* /usr/share/fonts/truetype/
COPY ./assets/fonts/TT-Travels-Next/* /usr/share/fonts/truetype/

RUN yarn

RUN yarn build
ENV PORT 8080
ENV NODE_ENV production

CMD [ "node", "dist/index.js" ]