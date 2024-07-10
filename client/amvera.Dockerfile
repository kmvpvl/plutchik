FROM node:22-alpine
RUN mkdir -p /usr/src/plutchart_client
WORKDIR /usr/src/plutchart_client
COPY client/ .
RUN npm i
RUN npm run build
RUN chown -R node /usr/src/plutchart_client
USER node
EXPOSE 3000
CMD npm run start