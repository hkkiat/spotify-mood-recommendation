FROM node:14.17.3

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH


COPY package.json /usr/src/app/package.json
RUN npm install

COPY . .
RUN npm run build
CMD ["npm", "start"]
# start app
#CMD bash start-container.sh

