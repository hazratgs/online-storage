FROM node:latest
RUN mkdir /www
WORKDIR /www
ADD . /www
CMD ["node", "index.js"]
