FROM node:14.15.0-alpine3.12

WORKDIR /usr/src/dom-profile

COPY ./build ./build

RUN yarn global add serve

EXPOSE 5000

CMD ["serve","-s","build"]
