### compilation stage
FROM node:latest AS build

RUN mkdir /build
WORKDIR /build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY package.json .
RUN npm install 

COPY . .
RUN npm run build

#### NGINX FOR Single Page Application ####
FROM steebchen/nginx-spa

COPY --from=build /build/www /app

EXPOSE 80

CMD ["nginx"]