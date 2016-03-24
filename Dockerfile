FROM node

RUN mkdir -p /usr/app/
WORKDIR /usr/app/

COPY package.json ./
RUN npm install
RUN npm install -g bower gulp

RUN mkdir -p ./client

COPY .bowerrc ./
COPY bower.json ./
RUN bower install --allow-root

COPY client/libs ./client/libs_custom/
RUN cp -r client/libs_custom/* client/libs/ && rm -rf client/libs_custom
COPY client/assets ./client/assets/
COPY client/scripts ./client/scripts/
COPY client/styles ./client/styles/
COPY client/views ./client/views/

COPY experiment ./experiment
COPY materials ./materials
COPY server ./server
COPY app.js ./app.js

COPY gulpfile.js ./
RUN gulp build

EXPOSE 3000
CMD ["node", "app.js"]
