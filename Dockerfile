FROM ubuntu:latest

RUN apt update && \ 
    apt install -y git wget sudo && \
    apt install -y build-essential libpcre3 libpcre3-dev libssl-dev && \
    apt install -y zlib1g zlib1g-dev

RUN git config --global user.name "John Doe" && \
    git config --global user.email "jdoe@email.com" && \
    git config --global core.autocrlf false && \
    git config --global core.filemode false && \
    git config --global color.ui true

RUN git clone https://github.com/sergey-dryabzhinsky/nginx-rtmp-module

RUN wget http://nginx.org/download/nginx-1.17.3.tar.gz && \
    tar -xf nginx-1.17.3.tar.gz && \
    cd nginx-1.17.3 && \
    ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module && \
    make && \
    make install && \
    mv /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/nginx.conf.original

ADD nginx_conf/nginx.conf /usr/local/nginx/conf

ADD scripts/start_rtmp_server.sh ~/start_rtmp_server.sh

EXPOSE 1935

ENTRYPOINT ["/bin/bash", "~/start_rtmp_server.sh"]