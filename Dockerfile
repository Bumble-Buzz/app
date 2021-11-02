FROM node:16-slim

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install vim


# app
WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# CMD [ "npm", "start" ]
CMD [ "npm", "run", "dev" ]
