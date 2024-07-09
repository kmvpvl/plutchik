FROM node:22-alpine
RUN mkdir -p /usr/src/plutchart_server
WORKDIR /usr/src/plutchart_server
COPY server/ .
RUN npm i
RUN chown -R node /usr/src/plutchart_server
USER node
EXPOSE 8000
CMD npm run build