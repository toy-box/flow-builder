FROM nginx:1.16
MAINTAINER wishgood@gmail.com
COPY build /opt/flow-builder/build
COPY nginx.conf /etc/nginx/nginx.conf