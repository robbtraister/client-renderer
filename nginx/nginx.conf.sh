#!/bin/sh

cat <<EOF
daemon off;

pid ./nginx.pid;
error_log /dev/stderr;

worker_processes auto;

events {
  worker_connections 1024;
  multi_accept on;
}

http {
  server_tokens off;

  access_log /dev/stdout;

  gzip             on;
  gzip_comp_level  2;
  gzip_min_length  1400;
  gzip_proxied     expired no-cache no-store private auth;
  gzip_types       text/plain application/x-javascript application/json text/css;

  server {
    listen ${PORT:-8080} default_server;
    server_name _;

    root /workdir/docs;

    location / {
      if (\$args ~ (^|.*&)rendered=true(&.*|\$)) {
        set \$args \$1\$2;
        proxy_pass ${RENDERER:-http://localhost:8081};
      }

      try_files \$uri /index.html =404;
    }

    location = /favicon.ico {
      return 404;
    }
  }
}
EOF
