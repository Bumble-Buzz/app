FROM node:16-slim

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install vim -y
RUN apt-get install procps -y


# app
WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

CMD [ "npm", "start" ]
# CMD [ "npm", "run", "dev" ]
