FROM node:alpine

WORKDIR /usr/src/app

ARG PORT=4200

COPY . /usr/src/app

RUN npm install -g @angular/cli

RUN npm install

CMD ["ng", "serve", "--host", "0.0.0.0"]

# docker run -p 4201:4200 angular-docker