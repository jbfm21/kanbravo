FROM nginx
MAINTAINER KaoBravo <jbfm21@gmail.com>

ADD nginx.conf /etc/nginx/
ADD default.conf /etc/nginx/conf.d/

COPY ./app /usr/share/nginx/html

RUN mkdir -p /etc/nginx/certs
COPY ./certs /etc/nginx/certs