FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . . 

ENV DESCOPE_PROJECT_ID="REPLACE_WITH_PROJECT_ID"

EXPOSE 443

CMD [ "node", "./dist/index.js" ]