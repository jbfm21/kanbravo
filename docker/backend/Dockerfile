FROM node:4.2.3
MAINTAINER KaoBravo <jbfm21@gmail.com>

ADD ./docker/backend/package.json /tmp/package.json
RUN cd /tmp && npm install --only=production --production
RUN mkdir -p /usr/qkanban/app && cp -a /tmp/node_modules /usr/qkanban/app

RUN mkdir -p /data/app
RUN mkdir -p /data/app/static
RUN mkdir -p /data/app/static/images
RUN mkdir -p /data/app/static/attachments
RUN mkdir -p /data/app/tmp
RUN mkdir -p /data/app/tmp/restify
RUN mkdir -p /data/app/tmp/export
RUN mkdir -p /data/app/logs
RUN mkdir -p /data/app/config

RUN ln -s /data/app/static/images /usr/qkanban/app/images
RUN ln -s /data/app/static/attachments /usr/qkanban/app/attachments

RUN chmod -R o+rw /usr/qkanban/app/images
RUN chmod -R o+rw /usr/qkanban/app/attachments

RUN chmod -R o+rw /data/app

WORKDIR /usr/qkanban/app


RUN echo 'America/Sao_Paulo' > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata
ENV TZ 'America/Sao_Paulo'

COPY ./backend/main /usr/qkanban/app/
COPY ./docker/backend/app.json /usr/qkanban/app/config
COPY ./docker/backend/HTTPS.cert /data/app/config
COPY ./docker/backend/HTTPS.key /data/app/config


EXPOSE 3000

CMD [ "node", "--max_old_space_size=2048", "app.js" ]

