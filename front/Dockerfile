FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone
RUN npm i --force -y
COPY ./ ./
EXPOSE 3000
RUN npm run build
CMD [ "npm", "run", "start"]

