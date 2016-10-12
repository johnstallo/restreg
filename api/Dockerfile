FROM node:argon
EXPOSE 80

# Install global dependencies: bower
RUN npm install --global bower

# npm install
WORKDIR /app
COPY package.json .
RUN npm install

# bower install
RUN echo '{ "allow_root": true, "directory" : "src/public/bower_components" }' > /root/.bowerrc
COPY bower.json .bowerrc* ./
RUN bower install

# copy source
WORKDIR /app/src
COPY . .

CMD ["npm", "start"]
