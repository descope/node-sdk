FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

# RUN npm install

COPY . . 

EXPOSE 443

CMD [ "node", "./dist/index.js" ]
