FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
RUN npm ci --no-audit --no-fund
COPY frontend ./frontend
COPY backend ./backend
COPY packages ./packages
COPY database ./database
COPY docs/Cookora-Recipe-Backlog-300.json ./docs/Cookora-Recipe-Backlog-300.json
RUN npm run db:generate && npm run build

# Local development stack; contains migration tooling. Not a hardened production release.
FROM build AS api
ENV BIND_HOST=0.0.0.0
USER node
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "backend"]

FROM nginx:1.28-alpine AS web
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
