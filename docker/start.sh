#!/bin/sh
set -eu

: "${PORT:=10000}"
: "${BACKEND_PORT:=5008}"
: "${FRONTEND_PORT:=3000}"

envsubst '${PORT} ${BACKEND_PORT} ${FRONTEND_PORT}' \
  < /etc/nginx/templates/journiq.conf.template \
  > /etc/nginx/conf.d/default.conf

exec supervisord -c /etc/supervisor/conf.d/journiq.conf

