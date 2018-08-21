FROM mongo:3.2.0

RUN echo never | tee /sys/kernel/mm/transparent_hugepage/enabled
RUN echo never | tee /sys/kernel/mm/transparent_hugepage/defrag

#RUN mongod mongod --smallfiles --logpath /var/log/mongodb.log --dbpath /data/db
RUN mongod mongod --smallfiles --dbpath /data/db