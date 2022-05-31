# Base
FROM node:16.13.2-alpine3.14 as base

ARG APP_ENV=dev
ARG NEXTAUTH_URL=http://localhost:80

WORKDIR /usr/src/app

COPY ./.npmrc ./
COPY ./.env ./
COPY ./.env.development ./
COPY ./.env.production ./
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install


# Build
FROM node:16.13.2-alpine3.14 as builder

ARG APP_ENV
ENV NEXT_PUBLIC_APP_ENV=${APP_ENV}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

WORKDIR /usr/src/app

COPY . .
COPY --from=base /usr/src/app/node_modules ./node_modules

RUN npm run build


# Run
FROM node:16.13.2-alpine3.14

RUN apk --no-cache update
RUN apk --no-cache upgrade
RUN apk --no-cache add vim
RUN apk --no-cache add procps

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.env ./
COPY --from=builder /usr/src/app/.env.development ./
COPY --from=builder /usr/src/app/.env.production ./
COPY --from=builder /usr/src/app/Makefile ./
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /usr/src/app/.next
USER nextjs

EXPOSE 3000


CMD [ "npm", "run", "make", "start" ]
