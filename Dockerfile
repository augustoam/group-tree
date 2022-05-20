FROM node:14-alpine

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install && npm cache clear --force

COPY . .
RUN npm run compile && rm -rf src

EXPOSE 4000

CMD npm run start
