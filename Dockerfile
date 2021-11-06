FROM node:12
EXPOSE 3000

WORKDIR /work
COPY ./package.json /work/package.json
COPY ./package-lock.json /work/package-lock.json
COPY ./public /work/public
COPY ./src/ /work/src/
RUN npm install
RUN NODE_ENV=production npm run build
RUN npm install serve -g --silent

# CMD [ "npm", "start" ]
CMD [ "serve", "-p", "3000", "-s", "build" ]
