FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . . 

ENV DESCOPE_PROJECT_ID="XXX"

ENV DESCOPE_API_BASE_URL="https://172.17.0.1:8443/v1/"

EXPOSE 443

CMD [ "node", "./dist/index.js" ]