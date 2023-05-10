scp ./server.js root@124.222.44.34:/usr/local/backend/meeting/
ssh root@124.222.44.34 "docker cp  /usr/local/backend/meeting/server.js bc8c:/home/backend/meeting; docker restart bc8c;"