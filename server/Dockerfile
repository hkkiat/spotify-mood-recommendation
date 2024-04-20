FROM node:14.17.3

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

#RUN echo "deb http://archive.debian.org/debian stretch main" > /etc/apt/sources.list

# add `/usr/src/app/node_modules/.bin` to $PATH
#ENV PATH /usr/src/app/node_modules/.bin:$PATH

#COPY package.json /usr/src/app/package.json
#COPY . .

RUN npm install
RUN npm install bcrypt --save
#RUN npm install bcrypt

CMD ["npm", "start"]
