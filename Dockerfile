FROM node:22-bookworm AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:22-bookworm

ENV NODE_ENV=production
ENV PORT=10000
ENV BACKEND_PORT=5008
ENV FRONTEND_PORT=3000
ENV NEXT_PUBLIC_API_URL=/api

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    gettext-base \
    nginx \
    python3 \
    python3-pip \
    supervisor \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY AI-Model-Train-main/requirements-docker.txt ./AI-Model-Train-main/requirements-docker.txt
RUN pip3 install --break-system-packages --no-cache-dir -r ./AI-Model-Train-main/requirements-docker.txt

COPY backend ./backend
COPY AI-Model-Train-main ./AI-Model-Train-main
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY docker/nginx.conf.template /etc/nginx/templates/journiq.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/journiq.conf
COPY docker/start.sh /app/start.sh

RUN chmod +x /app/start.sh \
  && mkdir -p /run/nginx /var/log/supervisor

EXPOSE 10000

CMD ["/app/start.sh"]
