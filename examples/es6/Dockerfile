FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . . 

ENV DESCOPE_PROJECT_ID="XXX"

EXPOSE 443

CMD [ "node", "./dist/index.js" ]