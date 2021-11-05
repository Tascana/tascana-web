FROM node:12.21.0-alpine AS nodejs

# Stage 1
FROM nodejs AS deps

WORKDIR /usr/src/tascana

COPY package.json package-lock.json ./

# Stage 2
FROM nodejs as building

WORKDIR /usr/src/tascana

COPY --from=deps /usr/src/tascana .
RUN npm ci

COPY . .

RUN npm run build

# Stage 3
FROM nginx:1.21.0-alpine

RUN apk add --update nodejs
RUN apk add --update npm
RUN npm install -g runtime-env-cra

WORKDIR /www/tascana

COPY configs/nginx.conf /etc/nginx/nginx.conf

COPY --from=building /usr/src/tascana/build .
COPY --from=building /usr/src/tascana/.env.example ./.env

RUN echo $PORT
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/nginx.conf && runtime-env-cra && nginx -g 'daemon off;'
