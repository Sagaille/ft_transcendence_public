FROM node:16-alpine

WORKDIR /srcs

VOLUME [ "/srcs" ]

RUN apk update && apk upgrade && apk add bash

RUN npm install -g @nestjs/cli

ENTRYPOINT cd /srcs/back && npm ci --legacy-peer-deps && npx prisma generate && npx prisma db push --accept-data-loss && npm run start:dev
