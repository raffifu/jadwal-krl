FROM node:lts-alpine3.15

WORKDIR /app

COPY . . 

RUN npm install

CMD ["npm", "run", "start"]