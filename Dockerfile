FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333
EXPOSE 24678

CMD ["npm", "run", "dev"]
