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
