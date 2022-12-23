FROM nginx:alpine

ADD ./nginx/nginx-behind-traefik.conf /etc/nginx/nginx.conf
ADD ./nginx/conf.d/prod.conf /etc/nginx/conf.d/default.conf

ADD ./shapes-app /usr/share/nginx/html
