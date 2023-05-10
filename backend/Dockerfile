FROM node
WORKDIR /home/backend/meeting
COPY . /home/backend/meeting
RUN npm config set registry https://registry.npm.taobao.org
RUN npm i
EXPOSE 5000
CMD ["node","server.js"]