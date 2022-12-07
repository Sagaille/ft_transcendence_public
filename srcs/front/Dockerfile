FROM node:alpine

WORKDIR /app
COPY ./ /app

RUN apk update && apk upgrade && apk add bash

RUN npm install -g @angular/cli

ENTRYPOINT npm i && ng serve --host 0.0.0.0
