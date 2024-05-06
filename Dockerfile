#  Node 20
FROM node:latest


WORKDIR /app

COPY package*.json ./
COPY .env ./

# dependencias
RUN npm install

# archivos en general
COPY . .

# Puerto 8080 
EXPOSE 8080

CMD ["npm", "start"]
