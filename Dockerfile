FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY ./server.cjs ./
COPY ./package.json ./
RUN apk update && apk add git
RUN npm install --legacy-peer-deps

EXPOSE 80
CMD ["node", "server.cjs"]