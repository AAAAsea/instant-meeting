ssh root@124.222.44.34 "rm -rf /usr/local/vue/meeting; mkdir /usr/local/vue/meeting;"
scp -r ./dist/* root@124.222.44.34:/usr/local/vue/meeting