FROM robbtraister/phantomjs-base

RUN apk add --update --no-cache \
            nginx \
            nodejs \
            && \
    rm -rf /var/cache/apk/* && \
    nginx -v && \
    node -v

COPY nodejs/package.json ./nodejs/

RUN cd nodejs && \
    npm install --production && \
    npm cache clean

COPY nginx ./nginx
COPY nodejs ./nodejs
COPY phantomjs ./phantomjs

CMD \
    SOURCE="http://localhost:${PORT:-8080}" PORT=8081 phantomjs phantomjs/index.js & \
    PORT=${PORT:-8080} RENDERER=http://localhost:8081 node nodejs/index.js
    # nginx doesn't mix well with phantomjs at the moment
    # must be a header / cache issue; need to investigate
    #PORT=${PORT:-8080} RENDERER=http://localhost:8081 nginx/nginx.conf.sh > nginx/nginx.conf && nginx -p nginx -c nginx.conf
