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
    PORT=${PORT:-8080}; \
    PHANTOMJS_PORT=$(expr ${PORT} + 1); \

    if [ "${PROXY}" == "nginx" ] || [ "${PHANTOMJS}" == "server" ]; \
    then \
      SOURCE="http://localhost:${PORT}" PORT=${PHANTOMJS_PORT} phantomjs phantomjs/server.js & \
    fi; \

    if [ "${PROXY}" == "nginx" ]; \
    then \
      # nginx doesn't mix well with phantomjs at the moment
      # must be a header / cache issue; need to investigate
      RENDERER=http://localhost:${PHANTOMJS_PORT} nginx/nginx.conf.sh > nginx/nginx.conf && nginx -p nginx -c nginx.conf; \
    else \
      RENDERER=http://localhost:${PHANTOMJS_PORT} node nodejs/index.js; \
    fi;
